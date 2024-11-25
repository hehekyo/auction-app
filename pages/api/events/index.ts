import { NextApiRequest, NextApiResponse } from 'next';
import { AuctionEventListener } from '@/monitor';
import { getCurrentConfig } from '@/config/contracts';

let eventListener: AuctionEventListener | null = null;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允许' });
  }

  try {
    if (!eventListener) {
      const config = getCurrentConfig('hardhat');
      
      // 验证配置
      if (!config.network.rpcUrl) {
        throw new Error('RPC URL 未配置');
      }

      if (!config.contracts.auction.address) {
        throw new Error('合约地址未配置');
      }

      if (!Array.isArray(config.contracts.auction.abi)) {
        throw new Error('合约 ABI 配置无效');
      }

      // 创建监听器实例
      eventListener = new AuctionEventListener(
        config.network.rpcUrl,
        config.contracts.auction.address,
        config.contracts.auction.abi
      );
      
      await eventListener.startListening();
      return res.status(200).json({ message: '事件监听已启动' });
    }
    
    return res.status(200).json({ message: '事件监听已在运行' });
  } catch (error) {
    console.error('启动监听失败:', error);
    return res.status(500).json({ 
      message: '启动监听失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
}