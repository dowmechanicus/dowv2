const express = require('express')
const router = express.Router()

const query = require('../db')
const { EntityNotFoundError } = require('../errors')

const winrate = `
SELECT alias, player_id, SUM(CASE WHEN win=1 THEN 1 ELSE 0 END) AS wins, COUNT(*) as games FROM 
  (
    SELECT m2.alias, m2.player_id, m2.win, m2.team_id, m3.ranked
    FROM matchups m2
    INNER JOIN matches_dev m3 ON m2.match_id = m3.id
    WHERE ranked = 1 AND m2.team_id IS NULL and m2.player_id IN (?)
  ) as m4
GROUP BY player_id
ORDER BY wins DESC`;

const top25 = `
SELECT *,
  ROUND(glicko_rating) as rating,
  ROUND(ratings_deviation) as rd,
  last_cr_change as rating_change,
  last_position_change as position_change,
  ROUND(glicko_rating - (1.10 * ratings_deviation)) as cr
FROM players
ORDER BY cr DESC
LIMIT 25`;

router.get('/', async (req, res) => {
  try {
    const players = await query(top25);
    const player_ids = players.map(player => player.relic_id);
    const _winrate = winrate.replace('?', player_ids.map(x => '?').join(','));
    const winrates = await query(_winrate, [...player_ids]);

    return res.json({ players, winrates })
  } catch (error) {
    if (error instanceof EntityNotFoundError) {
      res.status(404).end();
    } else {
      res.status(500).json({ error: error.message })
    }
  }
})

module.exports = router
