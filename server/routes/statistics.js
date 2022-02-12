const express = require('express')
const router = express.Router();
const query = require('../db');
const logger = require('../logger');
const { checkCache, setCache } = require('../middleware/checkCache');

const get_faction_popularity = `
SELECT h.race_name, COUNT(*) as counts FROM matchups m 
INNER JOIN heroes h ON h.id = m.hero
INNER JOIN matches_dev md ON md.id = m.match_id
WHERE rating IS NOT NULL AND md.ranked = 1
GROUP BY race_name
ORDER BY race_name ASC;`;

const get_map_popularity = `SELECT map_id, m.screen_name, m.player_count, COUNT(*) as counts FROM matches_dev md 
INNER JOIN maps m ON m.id = md.map_id
WHERE m.player_count < 4 AND md.ranked = 1
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

const get_faction_win_ratio_over_game_length = `
SELECT "<= 5min" as game_length, h.race_name, COUNT(*) as counts, SUM(CASE WHEN win = 1 THEN 1 ELSE 0 END) as wins, SUM(CASE WHEN win = 1 THEN 1 ELSE 0 END)/COUNT(*) as win_ratio FROM matchups m
INNER JOIN matches_dev md ON match_id = md.id
INNER JOIN heroes h ON hero = h.id 
WHERE md.ranked = 1 AND md.ticks < 3000
GROUP BY race_name
UNION (
SELECT "6-10min" as game_length, h.race_name, COUNT(*) as counts, SUM(CASE WHEN win = 1 THEN 1 ELSE 0 END) as wins, SUM(CASE WHEN win = 1 THEN 1 ELSE 0 END)/COUNT(*) as win_ratio FROM matchups m
INNER JOIN matches_dev md ON match_id = md.id
INNER JOIN heroes h ON hero = h.id 
WHERE md.ranked = 1 AND md.ticks BETWEEN 3000 AND 6000
GROUP BY race_name
)
UNION (
SELECT "11-15min" as game_length, h.race_name, COUNT(*) as counts, SUM(CASE WHEN win = 1 THEN 1 ELSE 0 END) as wins, SUM(CASE WHEN win = 1 THEN 1 ELSE 0 END)/COUNT(*) as win_ratio FROM matchups m
INNER JOIN matches_dev md ON match_id = md.id
INNER JOIN heroes h ON hero = h.id 
WHERE md.ranked = 1 AND md.ticks BETWEEN 6000 AND 8999
GROUP BY race_name
)
UNION (
SELECT "16-20min" as game_length, h.race_name, COUNT(*) as counts, SUM(CASE WHEN win = 1 THEN 1 ELSE 0 END) as wins, SUM(CASE WHEN win = 1 THEN 1 ELSE 0 END)/COUNT(*) as win_ratio FROM matchups m
INNER JOIN matches_dev md ON match_id = md.id
INNER JOIN heroes h ON hero = h.id 
WHERE md.ranked = 1 AND md.ticks BETWEEN 9000 AND 119000
GROUP BY race_name
)
UNION (
SELECT "21-25min" as game_length, h.race_name, COUNT(*) as counts, SUM(CASE WHEN win = 1 THEN 1 ELSE 0 END) as wins, SUM(CASE WHEN win = 1 THEN 1 ELSE 0 END)/COUNT(*) as win_ratio FROM matchups m
INNER JOIN matches_dev md ON match_id = md.id
INNER JOIN heroes h ON hero = h.id 
WHERE md.ranked = 1 AND md.ticks BETWEEN 12000 AND 14999
GROUP BY race_name
)
UNION (
SELECT "26-30min" as game_length, h.race_name, COUNT(*) as counts, SUM(CASE WHEN win = 1 THEN 1 ELSE 0 END) as wins, SUM(CASE WHEN win = 1 THEN 1 ELSE 0 END)/COUNT(*) as win_ratio FROM matchups m
INNER JOIN matches_dev md ON match_id = md.id
INNER JOIN heroes h ON hero = h.id 
WHERE md.ranked = 1 AND md.ticks BETWEEN 15000 AND 17999
GROUP BY race_name
)
UNION (
SELECT "30+ min" as game_length, h.race_name, COUNT(*) as counts, SUM(CASE WHEN win = 1 THEN 1 ELSE 0 END) as wins, SUM(CASE WHEN win = 1 THEN 1 ELSE 0 END)/COUNT(*) as win_ratio FROM matchups m
INNER JOIN matches_dev md ON match_id = md.id
INNER JOIN heroes h ON hero = h.id 
WHERE md.ranked = 1 AND md.ticks >= 18000
GROUP BY race_name
);
`;

const get_hero_win_ratio = `
SELECT hero, h.short_name, h.race_name, COUNT(*) as counts, SUM(CASE WHEN m.win = 1 THEN 1 ELSE 0 END) as wins FROM matchups m 
INNER JOIN heroes h ON h.id = m.hero 
INNER JOIN matches_dev md ON md.id = match_id 
WHERE rating IS NOT NULL AND md.ranked = 1 AND team_id IS NULL
GROUP BY hero
ORDER BY race_name ASC;
`;

router.get('/', checkCache('statistics'), async (req, res) => {
  try {
    const hero_win_ratio = await query(get_hero_win_ratio);
    const faction_popularity = await query(get_faction_popularity);
    const faction_win_ratio = await query(get_faction_win_ratio);
    const faction_win_ratio_over_game_length = await query(get_faction_win_ratio_over_game_length);
    const map_popularity = await query(get_map_popularity);
    const game_length = await query(get_game_length);

    const result = {
      hero_win_ratio,
      faction_popularity,
      faction_win_ratio,
      faction_win_ratio_over_game_length,
      map_popularity,
      game_length
    }

    await setCache('statistics', 86400, JSON.stringify(result));
    logger.debug('Adding statistics to the cache', { service: 'statistics' })
    res.json({ ...result })
  } catch (error) {
    logger.error(error, { service: 'statistics' })
    res.status(500).json({ message: error.message })
  }

})


module.exports = router;
