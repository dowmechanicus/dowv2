const express = require('express')
const router = express.Router()

const query = require('../db')
const { EntityNotFoundError } = require('../errors')

const extended_player_details = `
SELECT *, SUM(CASE WHEN win=1 THEN 1 ELSE 0 END) AS wins, COUNT(*) AS games, ROUND(glicko_rating - (1.10 * ratings_deviation)) as cr FROM (
	SELECT alias, player_id, win, team_id, ranked FROM matchups m 
	INNER JOIN matches_dev md ON m.match_id = md.id	
	WHERE ranked = 1 AND team_id IS NULL AND player_id = ?
) as mm
INNER JOIN players p ON p.relic_id = ?;
`;

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const player = await query(extended_player_details, [id, id]);

    if (!player || !player[0]) {
      throw new EntityNotFoundError('Player');
    }

    res.json({
      ...player[0]
    })
  } catch (error) {
    if (error instanceof EntityNotFoundError) {
      res.status(404).end();
    } else {
      res.status(500).json({ error: error.message })
    }
  }
})

module.exports = router;
