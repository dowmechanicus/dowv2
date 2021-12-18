const express = require('express')
const morgan = require('morgan')
const app = express();

const matches = require('./routes/matches')
const ladder = require('./routes/ladder')
const players = require('./routes/players')
const statistics = require('./routes/statistics')

app.use(morgan('dev'))

app.use('/matches', matches)
app.use('/ladder', ladder)
app.use('/players', players)
app.use('/statistics', statistics)

app.listen(4000, () => {
  console.log('Listening on port:', 4000)
});
