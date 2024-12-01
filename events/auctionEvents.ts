import { ethers, formatUnits } from 'ethers';
import AuctionManagerABI from '../abi/AuctionManager.json';
import { getBlockTimestamp } from './utils';
import ERC721ABI from '../abi/DANFT.json';

interface AuctionStartedEvent {
  transactionHash: string;
  blockNumber: number;
  timestamp: number | null;
  args: {
    auctionId: string;
    seller: string;
    nftContract: string;
    tokenId: string;
    tokenURI: string;
    auctionType: string;
    startingPrice: string;
    reservePrice: string;
    duration: string;
    depositAmount: string;
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
    
    const formattedEvents = events.map(async (event) => {
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
            tokenURI,
            auctionType,
            startingPrice,
            reservePrice,
            duration,
            depositAmount,
            startTime,
            endTime
          ] = event.args;

          result.args = {
            auctionId: auctionId.toString(),
            seller,
            nftContract,
            tokenId: tokenId.toString(),
            tokenURI,
            auctionType: auctionType.toString(),
            startingPrice: formatDATAmount(startingPrice),
            reservePrice: formatDATAmount(reservePrice),
            duration: duration.toString(),
            depositAmount: formatDATAmount(depositAmount),
            startTime: startTime.toString(),
            endTime: endTime.toString()
          };
        }
      }
      
      return result;
    });

    // 等待所有事件处理完成
    const processedEvents = await Promise.all(formattedEvents);

    // 获取时间戳
    const timestamps = await Promise.all(
      processedEvents.map(event => getBlockTimestamp(provider, event.blockNumber))
    );

    processedEvents.forEach((event, index) => {
      event.timestamp = timestamps[index];
    });

    return {
      success: true,
      data: processedEvents
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