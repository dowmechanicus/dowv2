const express = require('express')
const router = express.Router()

const query = require('../db')
const { EntityNotFoundError } = require('../errors')

const matches_with_maps = `
SELECT matches.id, matches.ticks, matches.p1_hero, matches.p2_hero, matches.p1_name, matches.p2_name, matches.p1_rating, matches.p1_outcome_rating, matches.p1_rd, matches.p1_outcome_rd, matches.p2_rating, matches.p2_outcome_rating, matches.p2_rd, matches.p2_outcome_rd, matches.ranked, matches.unix_utc_time, matches.winner, m.screen_name as map_name FROM matches 
INNER JOIN maps m ON matches.\`map\` = m.id
WHERE ranked = 1 ORDER BY id DESC
LIMIT ? OFFSET ?
`;

router.get('/', async (req, res) => {
  try {
    const size = 25;
    const page = parseInt((req.query.offset) ?? 0);
    const offset = (size * page) - size > 0 ? (size * page) - size : 0;

    const totalElements = await query('SELECT COUNT(*) as totalElements FROM matches');
    const data = await query(matches_with_maps, [size, offset]);

    return res.json({ data, totalElements: totalElements[0]?.totalElements });
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const match = await query('SELECT matches.*, maps.screen_name as map_name, maps.file_name as file_name FROM matches INNER JOIN maps on matches.map=maps.id WHERE matches.id = ?', [id]);

    if (!match || !match[0]) {
      throw new EntityNotFoundError('Match');
    }

    res.json({
      ...match[0]
    })

  } catch (error) {
    if (error instanceof EntityNotFoundError) {
      res.status(404).end();
    } else {
      res.status(500).json({ error: error.message })
    }
  }
})

module.exports = router