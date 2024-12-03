// pages/api/auctions/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/prisma';
// import { createAuctionOnBlockchain } from '../../../lib/contract';
import { ethers } from 'ethers';
import { getAuctionStartedEvents, getAuctionEvents } from '../../../events/auctionEvents';
import { getAuctionsWithBids } from '../../../events/auctionEventAggregator';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // if (req.method === 'GET') {
  //   const auctions = await db.auction.findMany({
  //     where: { ended: false },
  //     orderBy: { endTime: 'desc' },
  //   });
  //   res.status(200).json(auctions);
  // } else if (req.method === 'POST') {
  //   // const { minBid, duration } = req.body;

  //   // try {
  //   //   const auctionId = await createAuctionOnBlockchain(minBid, duration);
  //   //   const endTime = new Date(Date.now() + duration * 1000);

  //   //   const auction = await prisma.auctionItem.create({
  //   //     data: {
  //   //       id: auctionId,
  //   //       sellerAddress: '0xSellerAddress',
  //   //       minBid: parseFloat(minBid),
  //   //       endTime,
  //   //     },
  //   //   });

  //   //   res.status(201).json(auction);
  //   // } catch (error) {
  //   //   res.status(500).json({ error: 'Failed to create auction' });
  //   // }
  // } else {
  //   res.setHeader('Allow', ['GET', 'POST']);
  //   res.status(405).end(`Method ${req.method} Not Allowed`);
  // }

  // 使用示例
  if (!process.env.RPC_URL || !process.env.CONTRACT_ADDRESS) {
    throw new Error('Missing RPC_URL or CONTRACT_ADDRESS in environment variables');
  }
  
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const contractAddress = process.env.CONTRACT_ADDRESS

const latestBlock = await provider.getBlockNumber();

// const auctions = await getAuctionsWithBids(
//   provider,
//   contractAddress,
//   0, // fromBlock
//   latestBlock // toBlock
// );
const auctions = await getAuctionStartedEvents(
  provider,
  contractAddress,
  0, // fromBlock
  latestBlock // toBlock
);

console.log("============latestBlock=============",latestBlock);


// const auctions = await getAuctionStartedEvents(
//   provider,
//   contractAddress,
//   0, // fromBlock
//   latestBlock // toBlock
// );


console.log("============chain auctions=============",auctions);
const auctionsData = auctions.data?.map((auction) => {
  return auction.args
});

console.log("============chain auctionsData=============",auctionsData);
res.status(200).json(auctionsData);



// 获取特定拍卖的所有信息


}
