import { query } from '@/lib/db';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

const handler: NextApiHandler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  try {
    const maps = await query('SELECT * FROM maps');
    res.json({ maps });
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }

}

export default handler
