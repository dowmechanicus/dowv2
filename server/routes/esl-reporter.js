const express = require('express');
const path = require('path');



const { Match } = require('./esl-reporter.service');
const logger = require('../logger');

const { getHeroId } = require('../functions');


const Router = express.Router();

const RECPATH = process.env?.RECPATH ?? '';
const loggerMeta = { service: 'ESL-Reporter' };

Router.post('/', async (req, res) => {
    let match = { ...req.body };

    // set match reporter to IP from req object
    match.reporter.ipaddr = req.socket?.remoteAddress;

    // set filename for replay file to pattern %08x_%s.rec
    const filename = `${match.id}_${match.map}.rec`;
    const pathname = path.join(RECPATH, filename);
  const compressedFilePath = `${pathname}.gz`;

    // if dev flag is set in JSON, do NOT save replay data but return { response: ok }
    // if (match.dev) {
    //   return res.status(200).json({ response: 'ok' });
    // }


  Match.writeReplayFileToDisk(pathname, compressedFilePath, match.replay)
    .then(() => Match.parseReplayFile(pathname))
    .then(parsed => Promise.resolve({ ...match, ...parsed }))
    .then(match => Match.validateReplay(match)
      .then(() => Match.writeReplayFileToS3Bucket(compressedFilePath))
      .then(() => Match.deleteReplayFileFromDisk(compressedFilePath))
      .then(() => Promise.resolve(match))
    )
    .then(match => Match.addFlagIfLeagueMatch(match))
    .then(match => Match.writeReplayToDataBase(match))
    .then(match => res.status(200).json(match))
    .catch(error => {
      logger.error(error?.error ?? error?.message ?? error, loggerMeta);
      res.status(error?.status ?? 500).json({ ...error });
    });
});

module.exports = Router;

