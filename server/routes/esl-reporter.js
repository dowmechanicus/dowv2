const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const { createGzip } = require('zlib');
const { pipeline } = require('stream');
const { promisify } = require('util');

const logger = require('../logger');
const { createReadStream, createWriteStream } = require('fs');
const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const query = require('../db');
const { getHeroId } = require('../functions');
const pipe = promisify(pipeline);
const exec = promisify(require('child_process').exec);

const Router = express.Router();

const RECPATH = process.env?.RECPATH ?? '';
const loggerMeta = { service: 'ESL-Reporter' };

Router.post('/', async (req, res) => {
  try {
    let match = { ...req.body };

    // set match reporter to IP from req object
    match.reporter.ipaddr = req.socket?.remoteAddress;

    // set filename for replay file to pattern %08x_%s.rec
    const filename = `${match.id}_${match.map}.rec`;
    const pathname = path.join(RECPATH, filename);

    // if dev flag is set in JSON, do NOT save replay data but return { response: ok }
    // if (match.dev) {
    //   return res.status(200).json({ response: 'ok' });
    // }

    if (match.aborted) {
      return res.status(400).json({ respobse: 'aborted match, skipping' });
    }

    if (!Match.isMatch1v1(match)){
      logger.error('Match was not a 1v1. Skipping', loggerMeta);
      return res.status(400).json({ error: 'Only 1v1s are accepted' });
    }

    if (!match.replay) {
      logger.error(`Replay data missing for match ${match.id}. Skipping`, loggerMeta);
      return res.status(400).json({ error: 'replay data missing' });
    }

    // Write file to disk so it can be processed further
    const compressedFilePath = await Match.writeReplayFileToDisk(pathname, match.replay);

    if (compressedFilePath) {
      const extra = await Match.parseReplayFile(pathname);
      match = {
        ...match,
        ...extra,
      };

      delete match.replay;
    } else {
      logger.error('Could not save replay file to disk for downstream processing. Skipping', loggerMeta);
      return res.status(500).json({ error: 'Could not save replay file to disk for downstream processing. Skipping' });
    }

    // Upload
    if (compressedFilePath) {
      await Match.writeReplayFileToS3Bucket(compressedFilePath);
      await Match.deleteReplayFileFromDisk(compressedFilePath);
    }

    if (Match.isReporterDataNotEqualToParsedData(match)) {
      const error = `${match.frames} frames reported but ${extra.ticks} found in replay`;

      logger.error(error, loggerMeta);

      return res.status(400).json({ error });
    }

    const { ranked, league } = Match.isMatchUnranked(match);
    if (!ranked && !league) {
      logger.info('Match is not ranked -> ignoring', loggerMeta);
      return res.status(200).json({ response: 'ok' });
    } else {
      if (league && !ranked) {
        match.ranked = true;
        match.league = true;
      } else {
        match.ranked = ranked;
        match.league = league;
      }
    }

    await Match.writeReplayToDataBase(match);


    res.status(200).json(match);
  } catch (error) {
    res.status(500).json({ error: error?.message ?? error });
  }
});

module.exports = Router;

class Match {
  /**
   * Following properties are parsed from the file:
   * - md5 - MD5 key of replay file
   * - mod_version - mod version used in match
   * - player_count - how many players played in the game
   * - ranked - whether the game can be considered for ranked or not
   *    frames > 200
   *    VPs = 500
   *    not vanilla version
   * - chat - chat messages during the match
   * - actions - actions the players performed
   */
  static async parseReplayFile(pathname) {
    try {
      const command = `/home/mark/.cargo/bin/dow_replay_parser ${pathname}`;
      logger.debug('Parsing replay file');
      const { stdout, stderr } = await exec(command);
      logger.debug('Done parsing replay file');

      let json = JSON.parse(stdout);

      return {
        md5: json?.md5 ?? null,
        mod_version: json?.mod_version ?? null,
        player_count: json?.map?.maxplayers ?? null,
        chat: json?.messages ?? [],
        actions: json?.actions ?? [],
        players: json?.players ?? [],
        observers: json?.observers ?? [],
      };
    } catch (error) {
      logger.error(error?.message ?? error, loggerMeta);
      return null;
    }
  }

  static async writeReplayFileToDisk(pathname, data) {
    try {
      const gzip = async (input, output) => {
        const gzip = createGzip();
        const source = createReadStream(input);
        const destination = createWriteStream(output);
        await pipe(source, gzip, destination);
      };

      const buffer = Buffer.from(data, 'base64');
      logger.debug('Writing replay data to disk' + pathname)
      await fs.writeFile(pathname, buffer);
      const outputPath = `${pathname}.gz`
      await gzip(pathname, outputPath);

      return outputPath;
    } catch (error) {
      logger.error(error?.message ?? error, loggerMeta);
    }
  }

  static async writeReplayFileToS3Bucket(compressedFilePath) {
    const Key = path.basename(compressedFilePath, '.rec.gz');
    const fileStream = createReadStream(compressedFilePath);
    const s3Client = new S3Client({ region: 'eu-central-1' });

    const config = {
      Bucket: 'dow2-replays',
      Key,
      Body: fileStream,
      ACL: 'public-read',
      ContentType: 'application/octet-stream',
      ContentEncoding: 'gzip'
    };

    try {
      const data = await s3Client.send(new PutObjectCommand(config));
      logger.debug(`Response from AWS: ${JSON.stringify(data)}`, loggerMeta);

      if (data.$metadata.httpStatusCode !== 200) {
        logger.error('Something went wrong while uploading the file to AWS', loggerMeta);
      } else {
        logger.info(`Successfully uploaded file ${Key} to AWS S3 storage`, loggerMeta);
      }
    } catch (error) {
      logger.error(error?.message ?? error, loggerMeta);
    }
  }

  static async deleteReplayFileFromDisk(compressedFilePath) {
    const filename = path.basename(compressedFilePath);
    const uncompressedFilePath = path.dirname(compressedFilePath);
    const uncompressedFilename = path.basename(compressedFilePath, '.gz');

    try {
      await fs.unlink(compressedFilePath);
      logger.debug(`Removed ${filename} from disk`, loggerMeta);

      await fs.unlink(path.join(uncompressedFilePath, uncompressedFilename));
      logger.debug(`Removed ${uncompressedFilename} from disk`, loggerMeta);
    } catch (error) {
      logger.error(error?.message ?? error, loggerMeta);
    }
  }

  static isReporterDataNotEqualToParsedData(match) {
    return Math.abs(match.frames - match.ticks) > 10;
  }

  static isMatchUnranked(match) {
    const unranked = match.chat
      .filter(message => match?.players?.includes(message.sender))
      .filter(message => message?.tick <= 450)
      .some(message => /unranked/.test(message));

    // Check if it is a league match -> always ranked
    const league = match.chat
      .filter(message => match?.players?.includes(message.sender))
      .filter(message => message?.tick <= 450)
      .some(message => /^l$/.test(message));

    return {
      ranked: match.frames < 200 || match?.game?.victory_points !== 500 || unranked,
      league
    };
  }

  static isMatch1v1(match) {
    return match?.players?.length === 2;
  }

  static async writeReplayToDataBase(match) {
    try {
      // Find the map this match was played on, so we can enter the maps id to the database
      const [{ id }] = await query('SELECT id FROM maps WHERE maps.file_name = ?', [match.map]);

      if (!id) {
        throw new Error('Could not find map from the replay file. Skipping writing to database');
      }

      // Add the match outcome to the matches_dev table
      const { insertId } = await query(
        'INSERT INTO matches_dev (session_id, map_id, md5, ticks, finished_at, ranked, winner, chat, mod_chksum, observers) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [match.id, id, match.md5, match.frames, match?.reporter?.date, match.ranked, match.winner + 1, JSON.stringify(match.chat), parseInt(match.mod_version), JSON.stringify(match.observers)]
      );

      if (!insertId) {
        throw new Error('Match could not be added to matches_dev. Skipping');
      }

      if (match.players.length < 1) {
        throw new Error('Player list is empty. Looks like there is a problem with the replay file. Skipping');
      }

      // Add the match outcome to the matchups table for each player
      const queries = match.players.map(player => {
        return query(
          'INSERT INTO matchups (match_id, player_id, hero, alias, slot, sim_id, win) VALUES (?,?,?,?,?,?,?)',
          [insertId, player.relic_id, player?.hero, player?.name, player?.slot, player?.sim_id, match.winner == player?.team]
        );
      });

      await Promise.all(queries);

      // Add match data to the matches table
      const reporterDate = match.reporter.date;
      const mapId = id;
      const modVersion = match.mod_version;
      const p1 = match.players[0];
      const p2 = match.players[1];
      const p1_hero = getHeroId(p1.race, p1.hero);
      const p2_hero = getHeroId(p2.race, p2.hero);

      const winner = match.winner == p1.team ? 1 : match.winner == p2.team ? 2 : 0;

      await query(
        'INSERT INTO matches (match_relic_id, md5, mod_version, unix_utc_time, p1_relic_id, p2_relic_id, p1_name, p2_name, p1_hero, p2_hero, p1_rank, p2_rank, map, ticks, winner, ranked, chat, league) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [match.id, match.md5, modVersion, reporterDate, p1.relic_id, p2.relic_id, p1.name, p2.name, p1_hero, p2_hero, 0, 0, mapId, match.frames, winner, winner ? match.ranked : 0, match.chat, match.league]
        );

    } catch (error) {
      logger.error(error?.message ?? error, loggerMeta);
      throw new Error(error);
    }
  }
}
