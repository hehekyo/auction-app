import { ethers } from 'ethers';
import DANFTABI from '../abi/DANFT.json';
import { getBlockTimestamp } from './utils';

interface NFTMintedEvent {
  transactionHash: string;
  blockNumber: number;
  timestamp: number | null;
  args: {
    tokenId: string;
    to: string;
    imageURI: string;
    timestamp: string;
  };
}

const formatTokenId = (tokenId: bigint) => {
  return tokenId.toString();
};

export async function getNFTMintedEvents(
  provider: ethers.Provider,
  contractAddress: string,
  fromBlock: number,
  toBlock: number,
  filters: any = {}
) {
  try {
    if (!provider || !contractAddress) {
      throw new Error('Invalid provider or contract address');
    }
    
    const contract = new ethers.Contract(contractAddress, DANFTABI.abi, provider);
    const filter = contract.filters.NFTMinted(...Object.values(filters));
    const events = await contract.queryFilter(filter, fromBlock, toBlock);
    
    const formattedEvents = events.map(async (event) => {
      const result = {
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        timestamp: null as number | null,
        args: {} as Record<string, string>
      };
      
      if ('args' in event && Array.isArray(event.args)) {
        const [tokenId, to, imageURI, timestamp] = event.args;

        result.args = {
          tokenId: formatTokenId(tokenId),
          to,
          imageURI,
          timestamp: timestamp.toString()
        };
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

// 便捷方法：按 tokenId 获取单个 NFT 的铸造事件
export async function getNFTMintedEventByTokenId(
  provider: ethers.Provider,
  contractAddress: string,
  tokenId: string,
  fromBlock: number,
  toBlock: number
) {
  const filter = { tokenId };
  const result = await getNFTMintedEvents(provider, contractAddress, fromBlock, toBlock, filter);
  
  if (result.success && result.data && result.data.length > 0) {
    return {
      success: true,
      data: result.data[0]
    };
  }
  
  return {
    success: false,
    error: 'NFT mint event not found'
  };
} 