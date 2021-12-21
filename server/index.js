const express = require('express')
const morganMiddleware = require('./morgan');
const logger = require('./logger');
const app = express();

const matches = require('./routes/matches')
const ladder = require('./routes/ladder')
const players = require('./routes/players')
const statistics = require('./routes/statistics');

const port = process.env.PORT ?? 4000;

app.use(morganMiddleware)

app.use('/matches', matches)
app.use('/ladder', ladder)
app.use('/players', players)
app.use('/statistics', statistics)

app.listen(port, () => logger.info(`Listening on port: ${port}`));
