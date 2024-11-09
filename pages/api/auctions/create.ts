import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { sellerAddress, minBid, endTime } = req.body;

    try {
      const newAuction = await db.auction.create({
        data: {
          sellerAddress,
          minBid: parseFloat(minBid),
          highestBid: null,
          highestBidder: null,
          endTime: new Date(endTime),
          ended: false,
        }
      });
      res.status(201).json(newAuction);
    } catch (error) {
      console.error('Failed to create auction:', error);
      res.status(500).json({ error: "Failed to create auction" });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
