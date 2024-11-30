import type { NextApiRequest, NextApiResponse } from 'next';

interface NFT {
  id: string;
  name: string;
  image: string;
  price: string;
  tokenId: string;
  contractAddress: string;
}

/**
https://ipfs.io/ipfs/QmV6hWqJ1du519rrrk23G9XCmKuvRzvjaPUy2tLtfEwgse
https://ipfs.io/ipfs/QmUwivpSjVnzDaMEUZ47tHhmZbeao3eZQFqt2nKf5QzyaH
https://ipfs.io/ipfs/QmTM6pgQRbdJ7kfk1UYQDJE6g95Z2pc7g1Sb5rE1GY4JdN
https://ipfs.io/ipfs/Qme7QUnG7mpZPY36tnZpTSc3cY5HN9qQF4X86rj6odazxb
https://ipfs.io/ipfs/QmPQGcpySA3zNBBk26ZedjCLnsuTDJnzDemERM4n59HmQ1
 */
const nftUrls = [
    'QmV6hWqJ1du519rrrk23G9XCmKuvRzvjaPUy2tLtfEwgse',
    'QmUwivpSjVnzDaMEUZ47tHhmZbeao3eZQFqt2nKf5QzyaH',
    'QmTM6pgQRbdJ7kfk1UYQDJE6g95Z2pc7g1Sb5rE1GY4JdN',
    'Qme7QUnG7mpZPY36tnZpTSc3cY5HN9qQF4X86rj6odazxb',
    'QmPQGcpySA3zNBBk26ZedjCLnsuTDJnzDemERM4n59HmQ1'
]

const mockNFTs: NFT[] = [
  {
    id: '1',
    name: 'Crypto Punk #1234',
    image: `https://ipfs.io/ipfs/${nftUrls[0]}`,
    price: '0.5',
    tokenId: '1234',
    contractAddress: '0x1234...5678'
  },
  {
    id: '2',
    name: 'Bored Ape #5678',
    image: `https://ipfs.io/ipfs/${nftUrls[1]}`,
    price: '1.2',
    tokenId: '5678',
    contractAddress: '0x8765...4321'
  },
  {
    id: '3',
    name: 'Doodle #9012',
    image: `https://ipfs.io/ipfs/${nftUrls[2]}`,
    price: '0.8',
    tokenId: '9012',
    contractAddress: '0x9012...3456'
  },
  {
    id: '4',
    name: 'Azuki #3456',
    image: `https://ipfs.io/ipfs/${nftUrls[3]}`,
    price: '2.5',
    tokenId: '3456',
    contractAddress: '0x3456...7890'
  },
  {
    id: '4',
    name: 'Azuki #3456',
    image: `https://ipfs.io/ipfs/${nftUrls[4]}`,
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