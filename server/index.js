const express = require('express')
const cors = require('cors')
const morganMiddleware = require('./morgan');
const compression = require('compression');
const bodyParser = require('body-parser');

const logger = require('./logger');
const app = express();

const routes = require('./routes')
const reporterRoute = require('./routes/esl-reporter');

process.on('uncaughtException', (event) => {
  logger.error(event);
  process.exit(1);
});

const port = process.env.PORT ?? 4000;

app.use(bodyParser.json({ limit: '8mb' }))
app.use(morganMiddleware)
app.use(compression({
  filter: (req, res) => res.getHeader('content-type')?.includes('application/json')
}))

app.use('/api', routes);
app.use('/esl/esl-report.php', reporterRoute);
app.use(express.static('web'))


app.listen(port, () => logger.info(`Listening on port: ${port}`));
