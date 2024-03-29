const express = require('express')
const router = express.Router()
const axios = require('axios')

const { query } = require('../db')
const { EntityNotFoundError } = require('../errors')
const logger = require('../logger')
const { checkCache, setCache } = require('../middleware/checkCache');

const extended_player_details = `
SELECT *, p.steam_id, SUM(CASE WHEN win=1 THEN 1 ELSE 0 END) AS wins, COUNT(*) AS games, ROUND(glicko_rating - (1.10 * ratings_deviation)) as cr FROM (
	SELECT alias, player_id, win, team_id, ranked FROM matchups m 
	INNER JOIN matches_dev md ON m.match_id = md.id	
	WHERE ranked = 1 AND team_id IS NULL AND player_id = ?
) as mm
INNER JOIN players p ON p.relic_id = ?;
`;

const player_wins_per_map = `
SELECT SUM(CASE WHEN win=1 THEN 1 ELSE 0 END) as wins, screen_name, COUNT(*) as total_games FROM matchups a 
INNER JOIN matches_dev md ON md.id = match_id
INNER JOIN maps ma ON ma.id = md.map_id 
where player_id = ? and team_id IS NULL and md.ranked = 1
GROUP BY screen_name;
`;

const player_wins_per_hero = `
SELECT hero, hero_name, race_name, SUM(CASE WHEN win=1 THEN 1 ELSE 0 END) as wins, COUNT(*) as total_games FROM matchups a 
INNER JOIN heroes h ON h.id = a.hero
INNER JOIN matches_dev md ON md.id = match_id 
where player_id = ? and team_id IS NULL and md.ranked = 1
GROUP BY hero
`;

const player_rank = `
SELECT rank FROM (
	SELECT @rank:=@rank+1 as rank, last_steam_name, cr, relic_id
  FROM (
    SELECT relic_id, last_steam_name, ROUND(glicko_rating - (1.10 * ratings_deviation)) as cr FROM players ORDER BY cr DESC
  ) a, (SELECT @rank:=0) b
) c WHERE relic_id = ?;
`;

const player_glicko_history = `
SELECT p1_relic_id, p2_relic_id, p1_rating, p1_rd, p2_rating, p2_rd, winner, unix_utc_time, match_relic_id
  FROM matches
  WHERE ranked = 1 AND (p1_relic_id = ? OR p2_relic_id = ?)
  ORDER BY unix_utc_time ASC
`;

const get_players_steam_stats = async (steam_id) => {
  const steamAPIKey = process.env.STEAM_API_KEY;

  if (!steamAPIKey) {
    logger.error('Steam API Key not found', { service: 'players' });
    return null;
  }

  if (!steam_id) {
    return null;
  }

  const { data: steam_stats } = await axios(
    'http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2',
    {
      params: {
        key: steamAPIKey,
        steamids: steam_id
      }
    }
  );

  return steam_stats?.response?.players[0];
}

router.get('/:id', checkCache(), async (req, res) => {
  const { id } = req.params;

  try {
    const player = await query(extended_player_details, [id, id]);
    const wins_per_map = await query(player_wins_per_map, [id]);
    const wins_per_hero = await query(player_wins_per_hero, [id]);
    const rank = await query(player_rank, [id]);
    const glicko_history = await query(player_glicko_history, [id, id]);

    if (!player || !player[0]) {
      throw new EntityNotFoundError('Player');
    }

    /**
     * Let's not call the Steam API everytime we check the players stats.
     * Call Redis first and check if his stats were cached before
     */
    const steam_stats = await get_players_steam_stats(player[0]?.steam_id);

    const player_details = {
      data: {
        player: { ...player[0] },
        wins_per_map,
        wins_per_hero,
        rank: rank[0]?.rank ?? 0,
        glicko_history,
        steam_stats: steam_stats ?? {}
      }
    };

    /**
     * Cache player details for 10 minutes
     */
    setCache(req.originalUrl, 600, JSON.stringify(player_details));

    res.json(player_details);
  } catch (error) {
    logger.error(error, { service: 'players' });
    if (error instanceof EntityNotFoundError) {
      res.status(404).end();
    } else {
      res.status(500).json({ error: error.message })
    }
  }
})

router.get('/', async (req, res) => {
  try {
    const players = await query('SELECT * FROM players LIMIT 25;');
    const totalElements = await query('SELECT COUNT(*) as totalElements FROM players');

    res.json({
      players,
      totalElements: totalElements[0]?.totalElements
    })
  } catch (error) {
    logger.error(error, { service: 'players' });
    res.status(500).json({ error: error.message })
  }
})

module.exports = router;
