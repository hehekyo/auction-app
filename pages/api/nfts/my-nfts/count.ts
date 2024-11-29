import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      // 模拟 API 延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 返回模拟的 NFT 数量
      res.status(200).json({ count: 2 });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch NFT count' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 