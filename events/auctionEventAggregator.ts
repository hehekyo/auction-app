import { ethers } from 'ethers';
import { getAuctionEvents } from './auctionEvents';

interface AuctionWithBids {
  auction: {
    auctionId: string;
    seller: string;
    nftContract: string;
    tokenId: string;
    auctionType: string;
    startingPrice: string;
    reservePrice: string;
    duration: string;
    startTime: string;
    endTime: string;
    transactionHash: string;
    blockNumber: number;
    timestamp: number;
  };
  bids: Array<{
    bidder: string;
    bidAmount: string;
    timestamp: number;
    transactionHash: string;
    blockNumber: number;
  }>;
  status: {
    isEnded: boolean;
    finalPrice?: string;
    winner?: string;
    endTimestamp?: number;
  };
}

export async function getAuctionsWithBids(
  provider: ethers.Provider,
  contractAddress: string,
  fromBlock: number,
  toBlock: number
): Promise<{
  success: boolean;
  data?: AuctionWithBids[];
  error?: string;
}> {
  try {
    // 获取所有拍卖开始事件
    const auctionStartedResult = await getAuctionEvents(
      provider,
      contractAddress,
      'AuctionStarted',
      fromBlock,
      toBlock
    );

    if (!auctionStartedResult.success) {
      throw new Error(auctionStartedResult.error);
    }

    // 获取所有出价事件
    const bidEventsResult = await getAuctionEvents(
      provider,
      contractAddress,
      'BidPlaced',
      fromBlock,
      toBlock
    );

    // 获取所有结束事件
    const endedEventsResult = await getAuctionEvents(
      provider,
      contractAddress,
      'AuctionEnded',
      fromBlock,
      toBlock
    );

    // 组织数据结构
    const auctionsWithBids: AuctionWithBids[] = auctionStartedResult.data?.map(auction => {
      const auctionId = auction.args.auctionId;
      
      // 找出该拍卖的所有出价
      const relatedBids = bidEventsResult.success && bidEventsResult.data ? 
        bidEventsResult.data
          .filter(bid => bid.args.auctionId === auctionId)
          .map(bid => ({
            bidder: bid.args.bidder,
            bidAmount: bid.args.bidAmount,
            timestamp: bid.timestamp as number,
            transactionHash: bid.transactionHash,
            blockNumber: bid.blockNumber as number
          }))
          .sort((a, b) => b.timestamp - a.timestamp)
        : [];

      // 查找拍卖结束信息
      const endEvent = endedEventsResult.success && endedEventsResult.data ?
        endedEventsResult.data.find(event => event.args.auctionId === auctionId)
        : null;

      return {
        auction: {
          auctionId: auction.args.auctionId,
          seller: auction.args.seller,
          nftContract: auction.args.nftContract,
          tokenId: auction.args.tokenId,
          auctionType: auction.args.auctionType,
          startingPrice: auction.args.startingPrice,
          reservePrice: auction.args.reservePrice,
          duration: auction.args.duration,
          startTime: auction.args.startTime,
          endTime: auction.args.endTime,
          transactionHash: auction.transactionHash,
          blockNumber: auction.blockNumber as number,
          timestamp: auction.timestamp as number
        },
        bids: relatedBids,
        status: {
          isEnded: !!endEvent,
          finalPrice: endEvent?.args?.finalPrice,
          winner: endEvent?.args?.winner,
          endTimestamp: endEvent?.timestamp as number | undefined
        }
      };
    }) || [];

    // 按开始时间倒序排序
    auctionsWithBids.sort((a, b) => b.auction.timestamp - a.auction.timestamp);

    return {
      success: true,
      data: auctionsWithBids
    };

  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 