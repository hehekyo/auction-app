import type { NextApiRequest, NextApiResponse } from 'next';

interface NFTDetails {
  id: string;
  name: string;
  image: string;
  price: string;
  tokenId: string;
  contractAddress: string;
  description: string;
  owner: string;
}

const mockNFTDetails: { [key: string]: NFTDetails } = {
  '1': {
    id: '1',
    name: 'Crypto Punk #1234',
    image: '/nft-samples/1.jpg',
    price: '0.5',
    tokenId: '1234',
    contractAddress: '0x1234...5678',
    description: 'A unique Crypto Punk with rare attributes. This punk features a distinctive style that sets it apart from others in the collection.',
    owner: '0x9876...5432'
  },
  '2': {
    id: '2',
    name: 'Bored Ape #5678',
    image: '/nft-samples/2.jpg',
    price: '1.2',
    tokenId: '5678',
    contractAddress: '0x8765...4321',
    description: 'A bored ape yacht club member with unique traits. This ape comes with exclusive membership benefits and access to special events.',
    owner: '0x8765...4321'
  },
  // 添加更多 NFT 详情...
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { id } = req.query;
      
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const nftDetails = mockNFTDetails[id as string];
      
      if (!nftDetails) {
        return res.status(404).json({ error: 'NFT not found' });
      }
      
      res.status(200).json(nftDetails);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch NFT details' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 