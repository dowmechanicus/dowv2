import { query } from '@/lib/db';
import { PageResponse } from '@/lib/page-response.interface';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

const matches_with_maps: string = `
SELECT matches.id, matches.ticks, matches.p1_hero, matches.p2_hero, matches.p1_name, matches.p2_name, matches.p1_rating, matches.p1_outcome_rating, matches.p1_rd, matches.p1_outcome_rd, matches.p2_rating, matches.p2_outcome_rating, matches.p2_rd, matches.p2_outcome_rd, matches.ranked, matches.unix_utc_time, matches.winner, m.screen_name as map_name FROM matches 
INNER JOIN maps m ON matches.\`map\` = m.id
WHERE ranked = 1 ORDER BY id DESC
LIMIT ? OFFSET ?
`;
const handler: NextApiHandler = async (req: NextApiRequest, res: NextApiResponse<PageResponse<MatchDto> | { message: string }>) => {
  try {
    const size = 25;
    const page = parseInt((req.query.offset as string) ?? 0);
    const offset = (size * page) - size;

    const totalElements = await query('SELECT COUNT(*) as totalElements FROM matches');
    const data = await query(matches_with_maps, [size, offset]);

    return res.json({ data, totalElements: totalElements[0]?.totalElements });
  } catch (e: any) {
    res.status(500).json({ message: e.message })
  }
}

export default handler;

export interface MatchDto {
  match_relic_id: number;
  player_id: number;
  map_id: number;
  winner: number;
  ticks: number;
  chat: string;
  observers: string;
  mod_version: number;
}

const selectVsFromMatches: string = `SELECT a.match_id, a.alias as p1, b.alias as p2, a.hero as p1_hero, b.hero as  p2_hero FROM matchups a
INNER JOIN (SELECT * FROM matchups m GROUP BY match_id) as b
ON a.match_id = b.match_id WHERE a.player_id != b.player_id;`;
