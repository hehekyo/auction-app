import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { auctionId, bidderAddress, bidAmount } = req.body;

    try {
      const bid = await prisma.bid.create({
        data: {
          auctionId,
          bidderAddress,
          bidAmount: parseFloat(bidAmount),
          bidTime: new Date()
        }
      });
      res.status(201).json(bid);
    } catch (error) {
      console.error('Failed to create bid:', error);
      res.status(500).json({ error: "Failed to create bid" });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
