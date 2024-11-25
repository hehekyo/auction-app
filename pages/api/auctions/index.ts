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
const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
const contractAddress = '0x63fea6E447F120B8Faf85B53cdaD8348e645D80E';

const latestBlock = await provider.getBlockNumber();

const auctions = await getAuctionsWithBids(
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

res.status(200).json(auctions);

console.log("============chain auctions=============",auctions);

// 获取特定拍卖的所有信息


}
