import { query } from '@/lib/db';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

const handler: NextApiHandler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  const { hero, map } = req.query;

  const dbQuery: string = `
      SELECT matches.unix_utc_time, matches.p1_name, matches.p2_name, matches.p1_hero, matches.p2_hero, matches.winner, maps.screen_name as map_name FROM matches
      INNER JOIN maps ON maps.id = matches.map
      WHERE
        ${hero ? (map ? '(p1_hero = ? OR p2_hero = ?) AND' : '(p1_hero = ? OR p2_hero = ?)') : ''}
        ${map ? 'map = ?' : ''}
      LIMIT 50`;

  const queryParams: any[] = [];

  hero && queryParams.push(...[hero, hero]);
  map && queryParams.push(map);

  try {
    const matches = await query(dbQuery, [...queryParams]);

    return res.json({ matches });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export default handler;
