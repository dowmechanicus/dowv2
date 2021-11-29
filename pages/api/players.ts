import { query } from '@/lib/db';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

const handler: NextApiHandler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  try {
    const size = 25;
    const page = parseInt((req.query.offset as string) ?? 0);
    const offset = (size * page) - size;

    const totalElements: [{ totalElements: number }] = await query('SELECT COUNT(*) as totalElements FROM players');
    const players = await query(`SELECT * FROM players LIMIT ${size} OFFSET ${offset}`)

    return res.json({ players, totalElements: totalElements[0]?.totalElements });
  } catch (e: any) {
    res.status(500).json({ message: e.message })
  }
}

export default handler;
