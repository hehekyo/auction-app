import { ethers, formatUnits } from 'ethers';
import AuctionManagerABI from '../abi/AuctionManager.json';
import { getBlockTimestamp } from './utils';

interface AuctionStartedEvent {
  transactionHash: string;
  blockNumber: number;
  timestamp: number | null;
  args: {
    auctionId: string;
    seller: string;
    nftContract: string;
    tokenId: string;
    startingPrice: string;
    reservePrice: string;
    minBidIncrement: string;
    duration: string;
    initialBid: string;
    startTime: string;
    endTime: string;
  };
}

// 如果 DAT Token 使用不同的小数位数
const formatDATAmount = (amount: bigint, decimals: number = 18) => {
  return formatUnits(amount, decimals);
};

export async function getAuctionEvents(
  provider: ethers.Provider,
  contractAddress: string,
  eventName: 'AuctionStarted' | 'AuctionEnded',
  fromBlock: number,
  toBlock: number,
  filters: any = {}
) {
  try {
    if (!provider || !contractAddress) {
      throw new Error('Invalid provider or contract address');
    }
    
    const contract = new ethers.Contract(contractAddress, AuctionManagerABI.abi, provider);
    const filter = contract.filters[eventName](...Object.values(filters));
    const events = await contract.queryFilter(filter, fromBlock, toBlock);
    
    const formattedEvents = events.map(event => {
      const result = {
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        timestamp: null as number | null,
        args: {} as Record<string, string>
      };
      
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
            startingPrice: formatDATAmount(startingPrice),
            reservePrice: formatDATAmount(reservePrice),
            minBidIncrement: formatDATAmount(minBidIncrement),
            duration: duration.toString(),
            initialBid: formatDATAmount(initialBid),
            startTime: startTime.toString(),
            endTime: endTime.toString()
          };
        }
      }
      
      return result;
    });

    // 获取时间戳
    const timestamps = await Promise.all(
      formattedEvents.map(event => getBlockTimestamp(provider, event.blockNumber))
    );

    formattedEvents.forEach((event, index) => {
      event.timestamp = timestamps[index];
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

export const getAuctionStartedEvents = (
  provider: ethers.Provider, 
  contractAddress: string, 
  fromBlock: number, 
  toBlock: number
) => {
  return getAuctionEvents(provider, contractAddress, 'AuctionStarted', fromBlock, toBlock);
};

export const getAuctionEndedEvents = (
  provider: ethers.Provider, 
  contractAddress: string, 
  fromBlock: number, 
  toBlock: number
) => {
  return getAuctionEvents(provider, contractAddress, 'AuctionEnded', fromBlock, toBlock);
}; 