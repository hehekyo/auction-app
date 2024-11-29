import type { NextApiRequest, NextApiResponse } from 'next';

interface NFT {
  id: string;
  name: string;
  image: string;
  price: string;
  tokenId: string;
  contractAddress: string;
}

const mockNFTs: NFT[] = [
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
  },
  {
    id: '3',
    name: 'Doodle #9012',
    image: '/nfts/3.jpg',
    price: '0.8',
    tokenId: '9012',
    contractAddress: '0x9012...3456'
  },
  {
    id: '4',
    name: 'Azuki #3456',
    image: '/nfts/4.png',
    price: '2.5',
    tokenId: '3456',
    contractAddress: '0x3456...7890'
  }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 返回模拟数据
      res.status(200).json(mockNFTs);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch NFTs' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 