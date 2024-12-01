import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import { getNFTMintedEvents } from '@/events/nftEvents';

interface NFT {
  id: string;
  name: string;
  image: string;
  tokenId: string;
  owner: string;
  mintTime: number;
  contractAddress: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      // 初始化 provider
      const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
      const contractAddress = process.env.NFT_CONTRACT_ADDRESS;

      if (!contractAddress) {
        throw new Error('NFT contract address not configured');
      }

      // 获取最新区块
      const latestBlock = await provider.getBlockNumber();
      // 获取过去 10000 个区块的事件（可以根据需要调整）
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

      // 转换事件数据为 NFT 格式
      const nfts: NFT[] = result.data.map((event) => ({
        id: event.args.tokenId,
        name: `DA NFT #${event.args.tokenId}`,
        image: event.args.imageURI.replace('ipfs://', 'https://ipfs.io/ipfs/'),
        tokenId: event.args.tokenId,
        owner: event.args.to,
        mintTime: event.timestamp || 0,
        contractAddress: contractAddress
      }));

      // 按铸造时间倒序排序
      nfts.sort((a, b) => b.mintTime - a.mintTime);

      res.status(200).json(nfts);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch NFTs' 
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 