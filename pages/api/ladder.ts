import { query } from '@/lib/db';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

interface Player {
  cr: number;
  glicko_rating: number;
  last_steam_name: string;
  main_race: number;
  rating: number;
  rd: number;
  relic_id: number;
}

const winrate: string = `
SELECT alias, player_id, SUM(CASE WHEN win=1 THEN 1 ELSE 0 END) AS wins, COUNT(*) as games FROM 
  (
    SELECT m2.alias, m2.player_id, m2.win, m2.team_id, m3.ranked
    FROM matchups m2
    INNER JOIN matches_dev m3 ON m2.match_id = m3.id
    WHERE ranked = 1 AND m2.team_id IS NULL and m2.player_id IN (?)
  ) as m4
GROUP BY player_id
ORDER BY wins DESC`;

const top25: string = `
SELECT *,
  ROUND(glicko_rating) as rating,
  ROUND(ratings_deviation) as rd,
  last_cr_change as rating_change,
  last_position_change as position_change,
  ROUND(glicko_rating - (1.10 * ratings_deviation)) as cr
FROM players
ORDER BY cr DESC
LIMIT 25`;


const handler: NextApiHandler = async (req: NextApiRequest, res: NextApiResponse<any>) => {

  try {
    const players = await query(top25) as Player[];
    const player_ids: number[] = players.map(player => player.relic_id);
    const _winrate = winrate.replace('?', player_ids.map(x => '?').join(','));
    const winrates: any = await query(_winrate, [...player_ids]);

    return res.json({ players, winrates })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export default handler;


