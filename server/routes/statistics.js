const express = require('express')
const router = express.Router()
const redis = require('redis');
const query = require('../db')

const redisClient = redis.createClient(6379);
(async () => {
  await redisClient.connect()
})();

const checkCache = (cacheKey) => async (req, res, next) => {

  const { originalUrl } = req;
  const cached = await redisClient.get(cacheKey ?? originalUrl);

  if (!cached) {
    return next();
  } else {
    return res.json({ ...JSON.parse(cached) })
  }
}

const get_faction_popularity = `
SELECT h.race_name, COUNT(*) as counts FROM matchups m 
INNER JOIN heroes h ON h.id = m.hero 
WHERE rating IS NOT NULL GROUP BY race_name
ORDER BY counts DESC;`;

const get_hero_popularity = `SELECT hero, h.hero_name, COUNT(*) as counts FROM matchups m 
INNER JOIN heroes h ON h.id = m.hero 
WHERE rating IS NOT NULL
GROUP BY hero
ORDER BY counts DESC;`;

const get_map_popularity = `SELECT map_id, m.screen_name, m.player_count, COUNT(*) as counts FROM matches_dev md 
INNER JOIN maps m ON m.id = md.map_id
WHERE m.player_count < 4
GROUP BY map_id;`;

const get_game_length = `
SELECT "<= 5min" as game_length, count(ticks) as counts from matches m where ticks < 3000 AND ranked = 1
UNION (
	SELECT "6-10min" as game_length, count(ticks) as counts from matches m where ticks BETWEEN 3000 AND 5999 AND ranked = 1
)
UNION (
	SELECT "11-15min" as game_length, count(ticks) as counts from matches m where ticks BETWEEN 6000 AND 8999 AND ranked = 1
)
UNION (
	SELECT "16-20min" as game_length, count(ticks) as counts from matches m where ticks BETWEEN 9000 AND 11999 AND ranked = 1
)
UNION (
	SELECT "21-25min" as game_length, count(ticks) as counts from matches m where ticks BETWEEN 12000 AND 14999 AND ranked = 1
)
UNION (
	SELECT "26-30min" as game_length, count(ticks) as counts from matches m where ticks BETWEEN 15000 AND 17999 AND ranked = 1
)
UNION (
	SELECT "30+ min" as game_length, count(ticks) as counts from matches m where ticks >= 18000  AND ranked = 1
);
`;

const get_faction_win_ratio = `
SELECT h.race_name, COUNT(*) as counts, SUM(CASE WHEN m.win = 1 THEN 1 ELSE 0 END) as wins FROM matchups m 
INNER JOIN heroes h ON h.id = m.hero 
INNER JOIN matches_dev md ON md.id = match_id 
WHERE rating IS NOT NULL AND md.ranked = 1 AND team_id IS NULL
GROUP BY race_name
ORDER BY wins DESC;`;

const get_hero_win_ratio = `
SELECT hero, h.hero_name, COUNT(*) as counts, SUM(CASE WHEN m.win = 1 THEN 1 ELSE 0 END) as wins FROM matchups m 
INNER JOIN heroes h ON h.id = m.hero 
INNER JOIN matches_dev md ON md.id = match_id 
WHERE rating IS NOT NULL AND md.ranked = 1 AND team_id IS NULL
GROUP BY hero
ORDER BY wins DESC;
`;

router.get('/', checkCache('statistics'), async (req, res) => {
  try {
    const hero_popularity = await query(get_hero_popularity);
    const hero_win_ratio = await query(get_hero_win_ratio);
    const faction_popularity = await query(get_faction_popularity);
    const faction_win_ratio = await query(get_faction_win_ratio);
    const map_popularity = await query(get_map_popularity);
    const game_length = await query(get_game_length);

    const result = {
      hero_popularity,
      hero_win_ratio,
      faction_popularity,
      faction_win_ratio,
      map_popularity,
      game_length
    }

    await redisClient.setEx('statistics', 60, JSON.stringify(result));
    res.json({ ...result })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }

})


module.exports = router;
