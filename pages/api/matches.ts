import { query } from '@/lib/db';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

const matches_with_maps: string = `
SELECT matches.id, matches.ticks, matches.p1_hero, matches.p2_hero, matches.p1_name, matches.p2_name, matches.p1_rating, matches.p1_outcome_rating, matches.p1_rd, matches.p1_outcome_rd, matches.p2_rating, matches.p2_outcome_rating, matches.p2_rd, matches.p2_outcome_rd, matches.ranked, matches.unix_utc_time, matches.winner, m.screen_name as map_name FROM matches 
INNER JOIN maps m ON matches.\`map\` = m.id
WHERE ranked = 1 ORDER BY id DESC
LIMIT ? OFFSET ?
`;

type Data = {
  matches: any[],
  totalElements: number
}

const handler: NextApiHandler = async (req: NextApiRequest, res: NextApiResponse<Data | { message: string }>) => {
  try {
    const size = 25;
    const page = parseInt((req.query.offset as string) ?? 0);
    const offset = (size * page) - size;

    const totalElements = await query('SELECT COUNT(*) as totalElements FROM matches')
    const matches = await query(matches_with_maps, [size, offset]);

    return res.json({ matches, totalElements: totalElements[0]?.totalElements });
  } catch (e: any) {
    res.status(500).json({ message: e.message })
  }
}

export default handler;
