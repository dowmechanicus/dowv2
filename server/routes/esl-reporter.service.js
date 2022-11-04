/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable max-lines-per-function */
const { createReadStream, createWriteStream } = require('fs');
const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { createGzip } = require('zlib');
const fs = require('fs/promises');
const path = require('path');
const { pipeline } = require('stream');
const { promisify } = require('util');

const pipe = promisify(pipeline);
const exec = promisify(require('child_process').exec);

const { query } = require('../db');
const logger = require('../logger');
const { getHeroId } = require('../functions');

const loggerMeta = { service: 'ESL-Reporter' };


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
    const command = `/home/mark/.cargo/bin/dow_replay_parser ${pathname}`;
    logger.debug('Parsing replay file', loggerMeta);
    const { stdout, } = await exec(command);
    logger.debug('Done parsing replay file', loggerMeta);

    const json = JSON.parse(stdout);

    return {
      md5: json?.md5 ?? null,
      mod_version: json?.mod_version ?? null,
      mod_chksum: json?.mod_checksum ?? json?.mod_chksum ?? null,
      player_count: json?.map?.maxplayers ?? null,
      chat: json?.messages ?? [],
      actions: json?.actions ?? [],
      players: json?.players ?? [],
      observers: json?.observers ?? [],
      ticks: json?.ticks ?? null
    };
  }

  static validateReplay(match) {
    if (match?.aborted) {
      return Promise.reject({ error: 'aborted match, skipping', status: 400 })
    }

    if (!Match.isMatch1v1(match)) {
      return Promise.reject({ error: 'Only 1v1s are accepted', status: 400 });
    }

    if (!match?.replay) {
      return Promise.reject({ error: `replay data missing for ${match?.id}`, status: 400 });
    }

    if (Match.isReporterDataNotEqualToParsedData(match)) {
      return Promise.reject({ error: `${match?.frames} frames reported but ${match?.ticks} found in replay`, status: 400 })
    }

    if (Match.isMatchUnranked(match)) {
      return Promise.reject({ error: 'Only ranked matches are processed ', status: 400 });
    }

    return Promise.resolve(match);
  }

  static async writeReplayFileToDisk(pathname, outputPath, data) {
    const gzip = async (input, output) => {
      const gzip = createGzip();
      const source = createReadStream(input);
      const destination = createWriteStream(output);
      await pipe(source, gzip, destination);
    };

    const buffer = Buffer.from(data, 'base64');
    await fs.writeFile(pathname, buffer);
    await gzip(pathname, outputPath);

    return outputPath;
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

    const data = await s3Client.send(new PutObjectCommand(config));
    logger.debug(`Response from AWS: ${JSON.stringify(data)}`, loggerMeta);

    if (data.$metadata.httpStatusCode !== 200) {
      logger.error('Something went wrong while uploading the file to AWS', loggerMeta);
    } else {
      logger.info(`Successfully uploaded file ${Key} to AWS S3 storage`, loggerMeta);
    }
  }

  static async deleteReplayFileFromDisk(compressedFilePath) {
    const filename = path.basename(compressedFilePath);
    const uncompressedFilePath = path.dirname(compressedFilePath);
    const uncompressedFilename = path.basename(compressedFilePath, '.gz');

    await fs.unlink(compressedFilePath);
    logger.debug(`Removed ${filename} from disk`, loggerMeta);

    await fs.unlink(path.join(uncompressedFilePath, uncompressedFilename));
    logger.debug(`Removed ${uncompressedFilename} from disk`, loggerMeta);
  }

  static addFlagIfLeagueMatch(match) {
    if (Match.isLeagueMatch(match)) {
      return {
        ...match,
        ranked: true,
        league: true
      }
    }

    return {
      ...match,
      ranked: true
    }
  }

  static isReporterDataNotEqualToParsedData(match) {
    return Math.abs(match.frames - match.ticks) > 10;
  }

  static isLeagueMatch(match) {
    return match.chat
      .filter(message => match?.players?.includes(message.sender))
      .filter(message => message?.tick <= 450)
      .some(message => (/^l$/ui).test(message));
  }

  static isMatchUnranked(match) {
    if (match?.frames < 200 || match?.game?.victory_points !== 500) {
      logger.debug(`Dropping file because its either too short or VPs are not set to 500 - Length: ${match?.frames} frames | VPs: ${match?.game?.victory_points}`);
      return true;
    }

    const unranked = match.chat
      .filter(message => match?.players?.includes(message.sender))
      .filter(message => message?.tick <= 450)
      .some(message => (/unranked/ui).test(message));

    // Check if it is a league match -> always ranked
    const league = Match.isLeagueMatch(match);

    // League matches are always ranked
    if (league) {
      return false;
    }

    // All matches are ranked by default unless unranked was typed
    if (!unranked) {
      return false;
    }

    // All remaining games can only ever be unranked -> we don't want those in our db
    return true
  }


  static isMatch1v1(match) {
    return match?.players?.length === 2;
  }

  static async writeReplayToDataBase(match) {
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
      logger.error(`Match could not be added to matches_dev. Skipping match with id: ${match?.id}`, loggerMeta);
      throw new Error(`Match could not be added to matches_dev. Skipping match with id: ${match?.id}`);
    }

    if (match.players.length < 1) {
      logger.error(`Player list is empty. Looks like there is a problem with the replay file. Skipping match with id: ${match?.id}`)
      throw new Error(`Player list is empty. Looks like there is a problem with the replay file. Skipping match with id: ${match?.id}`);
    }

    // Add the match outcome to the matchups table for each player
    const queries = match.players.map(player => query(
        'INSERT INTO matchups (match_id, player_id, hero, alias, slot, sim_id, win) VALUES (?,?,?,?,?,?,?)',
        // eslint-disable-next-line eqeqeq
        [insertId, player.relic_id, player?.hero, player?.name, player?.slot, player?.sim_id, match.winner == player?.team]
    ));

    await Promise.all(queries);

    // Add match data to the matches table
    const reporterDate = match.reporter.date;
    const mapId = id;
    const modVersion = match.mod_version;
    const [p1, p2] = match.players;
    const p1_hero = getHeroId(p1.race, p1.hero);
    const p2_hero = getHeroId(p2.race, p2.hero);

    // eslint-disable-next-line no-nested-ternary, eqeqeq
    const winner = match.winner == p1.team ? 1 : match.winner == p2.team ? 2 : 0;

    await query(
      'INSERT INTO matches (match_relic_id, md5, mod_version, unix_utc_time, p1_relic_id, p2_relic_id, p1_name, p2_name, p1_hero, p2_hero, p1_rank, p2_rank, map, ticks, winner, ranked, chat, league) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [match.id, match.md5, modVersion, reporterDate, p1.relic_id, p2.relic_id, p1.name, p2.name, p1_hero, p2_hero, 0, 0, mapId, match.frames, winner, winner ? match.ranked : 0, match.chat, match.league]
    );

    return match;
  }

  static async writeActionDataToDatabase(match) {
    const queries = match.actions.map(({ tick, data, relic_id }) => query('INSERT INTO actions (tick, action_type, relic_id, match_relic_id, action_source, unit_id, action_context1, action_context2, item_id, mod_version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [tick, data[0], relic_id, match.id, data[6], data[9], data[10], data[11], data[12], match.mod_chksum]
    ));

    await Promise.all(queries);

    return match;
  }
}

module.exports = { Match }
