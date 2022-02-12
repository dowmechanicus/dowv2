require('core-js/stable');
require('regenerator-runtime/runtime');

const express = require('express');
const router = express.Router();

const matches = require('./matches')
const ladder = require('./ladder')
const statistics = require('./statistics')
const players = require('./players')

router.use('/matches', matches);
router.use('/ladder', ladder);
router.use('/statistics', statistics);
router.use('/players', players);

module.exports = router;
