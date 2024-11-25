import { ethers } from 'ethers';
import AuctionManagerABI from '../abi/AuctionManager.json';


export async function getAuctionEvents(
  provider: ethers.Provider,
  contractAddress: string,
  eventName: string,
  fromBlock: number,
  toBlock: number,
  filters: any = {}
) {
  try {
    // 创建合约实例
    const contract = new ethers.Contract(contractAddress, AuctionManagerABI.abi, provider);
    
    // 构建事件过滤器
    const filter = contract.filters[eventName](...Object.values(filters));
    
    // 查询事件日志
    const events = await contract.queryFilter(filter, fromBlock, toBlock);
    
    // 格式化返回结果
    const formattedEvents = events.map(event => {
      const result = {
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        timestamp: null as number | null,
        args: {} as Record<string, string>
      };
      
      // 根据事件类型进行不同的解析
      if ('args' in event && Array.isArray(event.args)) {
        if (event.fragment.name === 'AuctionStarted') {
          const [
            auctionId,
            seller,
            nftContract,
            tokenId,
            startingPrice,
            reservePrice,
            minBidIncrement,
            duration,
            initialBid,
            startTime,
            endTime
          ] = event.args;

          result.args = {
            auctionId: auctionId.toString(),
            seller,
            nftContract,
            tokenId: tokenId.toString(),
            startingPrice: startingPrice.toString(),
            reservePrice: reservePrice.toString(),
            minBidIncrement: minBidIncrement.toString(),
            duration: duration.toString(),
            initialBid: initialBid.toString(),
            startTime: startTime.toString(),
            endTime: endTime.toString()
          };
        } else if (event.fragment.name === 'BidPlaced') {
          const [
            auctionId,
            bidder,
            bidAmount,
            timestamp
          ] = event.args;

          result.args = {
            auctionId: auctionId.toString(),
            bidder,
            bidAmount: bidAmount.toString(),
            timestamp: timestamp.toString()
          };
        }
      }
      
      return result;
    });

    // 获取区块时间戳
    const timestamps = await Promise.all(
      formattedEvents.map(async event => {
        const block = await provider.getBlock(event.blockNumber);
        return block?.timestamp || null;
      })
    );

    // 添加时间戳
    formattedEvents.forEach((event, index) => {
      if (timestamps[index]) {
        event.timestamp = timestamps[index];
      }
    });

    return {
      success: true,
      data: formattedEvents
    };

  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

// 针对具体事件的便捷函数
export const getAuctionStartedEvents = (provider: ethers.Provider, contractAddress: string, fromBlock: number, toBlock: number) => {
  return getAuctionEvents(provider, contractAddress, 'AuctionStarted', fromBlock, toBlock);
};

export const getAuctionEndedEvents = (provider: ethers.Provider, contractAddress: string, fromBlock: number, toBlock: number) => {
  return getAuctionEvents(provider, contractAddress, 'AuctionEnded', fromBlock, toBlock);
};

export const getBidPlacedEvents = (provider: ethers.Provider, contractAddress: string, fromBlock: number, toBlock: number) => {
  return getAuctionEvents(provider, contractAddress, 'BidPlaced', fromBlock, toBlock);
}; 