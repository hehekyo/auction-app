import type { NextApiRequest, NextApiResponse } from 'next';
import { AuctionService } from '@/services/auctionService';

type BidRequest = {
  auctionId: string;
  bidAmount: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持 POST 请求' });
  }

  try {
    const { auctionId, bidAmount }: BidRequest = req.body;

    // 验证请求参数
    if (!auctionId || !bidAmount) {
      return res.status(400).json({ 
        error: '缺少必要参数',
        details: {
          auctionId: !auctionId ? '拍卖 ID 不能为空' : null,
          bidAmount: !bidAmount ? '出价金额不能为空' : null
        }
      });
    }

    // 获取 AuctionService 实例并调用 placeBid 方法
    const auctionService = AuctionService.getInstance();
    await auctionService.placeBid(auctionId, bidAmount);

    // 返回成功响应
    return res.status(200).json({
      success: true,
      message: '出价成功',
      data: {
        auctionId,
        bidAmount
      }
    });

  } catch (error: any) {
    console.error('出价失败:', error);

    // 处理特定错误
    if (error.message.includes('insufficient funds')) {
      return res.status(400).json({
        error: '余额不足',
        details: error.message
      });
    }

    if (error.message.includes('user rejected')) {
      return res.status(400).json({
        error: '用户拒绝交易',
        details: error.message
      });
    }

    // 返回通用错误
    return res.status(500).json({
      error: '出价失败',
      details: error.message
    });
  }
}
