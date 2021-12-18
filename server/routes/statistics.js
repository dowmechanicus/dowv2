const express = require('express')
const router = express.Router()
const redis = require('redis');

const redisClient = redis.createClient(6379);
(async () => {
  await redisClient.connect()
})();

const checkCache = async (req, res, next) => {

  let url = req.url;
  const cached = await redisClient.get(url);

  if (!cached) {
    return next();
  } else {
    return res.json({ message: cached })
  }
}

router.get('/', checkCache, async (req, res) => {
  let url = req.url;
  console.log(req.originalUrl)

  await redisClient.setEx(url, 60, 'Harry Potter');
  res.json({ message: 'ok' })
})


module.exports = router;
