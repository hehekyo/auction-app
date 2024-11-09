// pages/api/auctions/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  try {
    const auction = await prisma.auction.findUnique({
      where: { id: parseInt(id as string) },
      include: {
        bids: {
          select: {
            id: true,
            bidderAddress: true,
            bidAmount: true,
            bidTime: true
          },
          orderBy: {
            bidTime: 'desc'
          }
        }
      }
    });

    if (auction) {
      res.status(200).json(auction);
    } else {
      res.status(404).json({ message: 'Auction not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to load auction details', error });
  }
}
