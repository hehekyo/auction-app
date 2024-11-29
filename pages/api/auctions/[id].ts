// pages/api/auctions/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import { getAuctionDetailsAndBids } from '@/events/bidEvents';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: 'Invalid auction ID' });
  }

  const RPC_URL = process.env.RPC_URL;
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

  if (!RPC_URL || !CONTRACT_ADDRESS) {
    return res.status(500).json({ 
      message: 'Server configuration error', 
      error: 'Missing RPC_URL or AUCTION_MANAGER_ADDRESS' 
    });
  }

  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const result = await getAuctionDetailsAndBids(
      provider, 
      CONTRACT_ADDRESS, 
      id
    );

    if (result.success && result.data) {
      return res.status(200).json(result.data);
    } else {
      return res.status(404).json({ 
        message: 'Auction not found or failed to fetch details' 
      });
    }
  } catch (error) {
    console.error('Error in auction details API:', error);
    return res.status(500).json({ 
      message: 'Failed to load auction details', 
      error: (error as Error).message 
    });
  }
}
