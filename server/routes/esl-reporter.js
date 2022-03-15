const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const { createGzip } = require('zlib');
const { pipeline } = require('stream');
const { promisify } = require('util');

const logger = require('../logger');
const { createReadStream, createWriteStream } = require('fs');
const pipe = promisify(pipeline);
const exec = promisify(require('child_process').exec);

const Router = express.Router();

const RECPATH = '';
const RBPATH = '';
const RBSCRIPT = '';

Router.post('/', async (req, res) => {
  try {
    let match = { ...req.body };

    // set match reporter to IP from req object
    match.reporter = req.socket?.remoteAddress;

    // set filename for replay file to pattern %08x_%s.rec
    const filename = `${match.id}_${match.map?.name}.rec`;
    const pathname = path.join(RECPATH, filename);

    // if dev flag is set in JSON, do NOT save replay data but return { response: ok }
    // if (match.dev) {
    //   return res.status(200).json({ response: 'ok' });
    // }

    if (match.aborted) {
      return res.status(400).json({ respobse: 'aborted match, skipping' });
    }

    if (match.replay) {
      // execute parser to gain more info on from the replay itself

      const extra = await Match.parseReplayFile(pathname);
      match = {
        ...match,
        ...extra,
      };

      const compressedFilePath = Match.writeReplayFileToDisk(pathname, match.replay);
      Match.writeReplayFileToS3Bucket(compressedFilePath);
    } else {
      return res.status(400).json({ error: 'replay data missing' });
    }


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
   *    ticks > 200
   *    VPs = 500
   *    not vanilla version
   * - chat - chat messages during the match
   * - actions - actions the players performed
   */
  static async parseReplayFile(pathname) {
    try {
      const command = `echo Hallo`;
      const { stdout, stderr } = await exec(command);

      return {
        ...stdout,
        md5: null,
        mod_version: null,
        player_count: null,
        ranked: false,
        chat: [],
        actions: []
      };
    } catch (error) {
      logger.error(error)
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
      logger.debug(pathname)
      await fs.writeFile(pathname, buffer);
      const outputPath = `${pathname}.gz`
      await gzip(pathname, outputPath);

      return outputPath;
    } catch (error) {
      logger.error(error?.message ?? error);
    }
  }

  static async writeReplayFileToS3Bucket(compressedFilePath) {
    // write replay file to S3 bucket and remove it from disk afterwards
    // to not clutter our precious disk space
  }
}
