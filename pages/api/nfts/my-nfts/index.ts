import type { NextApiRequest, NextApiResponse } from 'next';

// 使用与之前相同的 mock 数据,但只返回一部分作为用户的 NFT
const mockMyNFTs = [
  {
    id: '1',
    name: 'Crypto Punk #1234',
    image: '/nfts/1.jpg',
    price: '0.5',
    tokenId: '1234',
    contractAddress: '0x1234...5678'
  },
  {
    id: '2',
    name: 'Bored Ape #5678',
    image: '/nfts/2.jpg',
    price: '1.2',
    tokenId: '5678',
    contractAddress: '0x8765...4321'
  }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      res.status(200).json(mockMyNFTs);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch NFTs' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 