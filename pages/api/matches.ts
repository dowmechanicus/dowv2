import { query } from '@/lib/db';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

const handler: NextApiHandler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  try {
    const offset = req.query.offset ?? 0;
    const size = 25;

    const totalElements = await query('SELECT COUNT(*) as totalElements FROM matches')
    const content = await query(`SELECT * FROM matches WHERE ranked = 1 ORDER BY id DESC LIMIT ${offset},${size}`)

    return res.json({ content, totalElements });
  } catch (e: any) {
    res.status(500).json({ message: e.message })
  }
}

export default handler;
