import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import { getNFTMintedEvents } from '@/events/nftEvents';

interface NFTDetails {
  id: string;
  name: string;
  image: string;
  price: string;
  tokenId: string;
  contractAddress: string;
  description: string;
  owner: string;
  mintTime: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { id } = req.query;
      if (!id || Array.isArray(id)) {
        throw new Error('Invalid NFT ID');
      }

      // 初始化 provider
      const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
      const contractAddress = process.env.NFT_CONTRACT_ADDRESS;

      if (!contractAddress) {
        throw new Error('NFT contract address not configured');
      }

      // 获取最新区块
      const latestBlock = await provider.getBlockNumber();
      // 获取过去 10000 个区块的事件
      const fromBlock = Math.max(0, latestBlock - 10000);

      const result = await getNFTMintedEvents(
        provider,
        contractAddress,
        fromBlock,
        latestBlock
      );

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch NFT events');
      }

      // 查找指定 ID 的 NFT
      const nftEvent = result.data.find(event => event.args.tokenId === id);

      if (!nftEvent) {
        return res.status(404).json({ error: 'NFT not found' });
      }

      // 获取当前所有者
      const contract = new ethers.Contract(
        contractAddress,
        ['function ownerOf(uint256 tokenId) view returns (address)'],
        provider
      );
      const currentOwner = await contract.ownerOf(id);

      // 构造 NFT 详情
      const nftDetails: NFTDetails = {
        id: nftEvent.args.tokenId,
        name: `DA NFT #${nftEvent.args.tokenId}`,
        image: nftEvent.args.imageURI.replace('ipfs://', 'https://ipfs.io/ipfs/'),
        price: '1000', // 从价格预言机或合约获取实际价格
        tokenId: nftEvent.args.tokenId,
        contractAddress: contractAddress,
        description: `This is DA NFT #${nftEvent.args.tokenId}, minted at block ${nftEvent.blockNumber}`,
        owner: currentOwner,
        mintTime: nftEvent.timestamp || 0
      };

      res.status(200).json(nftDetails);
    } catch (error) {
      console.error('Error fetching NFT details:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch NFT details' 
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 