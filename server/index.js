const express = require('express')
const cors = require('cors')
const morganMiddleware = require('./morgan');
const compression = require('compression');

const logger = require('./logger');
const app = express();

const routes = require('./routes')


process.on('uncaughtException', (event) => {
  logger.error(event);
  process.exit(1);
});

const port = process.env.PORT ?? 4000;

app.use(morganMiddleware)
app.use(compression({
  filter: (req, res) => res.getHeader('content-type').includes('application/json')
}))

app.use('/api', routes);
app.use(express.static('web'))


app.listen(port, () => logger.info(`Listening on port: ${port}`));
