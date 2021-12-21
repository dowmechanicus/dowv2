const morgan = require('morgan');
const logger = require('./logger');

const stream = {
  write: (message) => logger.http(message)
}

const skip = () => {
  const env = process.env.NODE_ENV || 'production';
  return env !== 'development';
};

const morganMiddleware = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  { stream }
);

module.exports = morganMiddleware;
