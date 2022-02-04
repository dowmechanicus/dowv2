const redis = require('redis');
const logger = require('../logger');

const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST ?? 'localhost'}:${process.env.REDIS_PORT ?? 6379}`,
});
(async () => {
  try {
    await redisClient.connect()
  } catch (error) {
    logger.error('Could not connect to Redis DB');
    logger.error(error);
  }
})();

const checkCache = (cacheKey) => async (req, res, next) => {

  try {
    const { originalUrl } = req;
    const cached = await redisClient.get(cacheKey ?? originalUrl);

    if (!cached) {
      logger.debug('No cache hit -> next()', { service: cacheKey ?? 'unknown' })
      return next();
    } else {
      logger.debug('Cache hit -> returning cached result', { service: cacheKey ?? 'unknown' })
      return res.json({ ...JSON.parse(cached) })
    }
  } catch (error) {
    logger.error(error.message, { service: cacheKey ?? 'unknown' })
  }
}

const setCache = (key, lifetime, value) => redisClient.setEx(key, lifetime, value);
const getCache = (key) => redisClient.get(key);

module.exports = {
  checkCache,
  setCache,
  getCache
}
