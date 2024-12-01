import { ethers } from 'ethers';
import AuctionManagerABI from '../abi/AuctionManager.json';
import { getBlockTimestamp } from './utils';

interface BidPlacedEvent {
  transactionHash: string;
  blockNumber: number;
  timestamp: number | null;
  args: {
    auctionId: string;
    bidder: string;
    bidAmount: string;
    timestamp: string;
  };
}

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

interface AuctionDetails {
  auctionId: string;
  seller: string;
  nftContract: string;
  tokenId: string;
  startingPrice: string;
  reservePrice: string;
  minBidIncrement: string;
  duration: string;
  startTime: string;
  endTime: string;
  highestBid: string;
  highestBidder: string;
  status: string;
}

interface GetAuctionDetailsResult {
  success: boolean;
  data?: {
    auctionDetails: AuctionDetails;
    bidHistory: BidPlacedEvent[];
  };
  error?: string;
}

export async function getAuctionDetailsAndBids(
  provider: ethers.Provider,
  contractAddress: string,
  auctionId: string
): Promise<GetAuctionDetailsResult> {
  try {
    const contract = new ethers.Contract(contractAddress, AuctionManagerABI.abi, provider);
    
    // 获取拍卖开始事件
    const auctionFilter = contract.filters.AuctionStarted(auctionId);
    const auctionEvents = await contract.queryFilter(auctionFilter);
    
    if (auctionEvents.length === 0) {
      throw new Error('Auction not found');
    }

    const auctionEvent = auctionEvents[0];
    const {
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
    } = auctionEvent.args;

    // 获取出价历史
    const bidFilter = contract.filters.BidPlaced(auctionId);
    const bidEvents = await contract.queryFilter(bidFilter);

    // 获取最高出价信息
    const bids = await Promise.all(
      bidEvents.map(async (event) => {
        const { bidder, bidAmount, timestamp } = event.args;
        return {
          bidder,
          amount: ethers.formatUnits(bidAmount, 18),
          timestamp: timestamp.toString()
        };
      })
    );

    // 根据出价金额排序，获取最高出价
    const sortedBids = [...bids].sort((a, b) => 
      parseFloat(b.amount) - parseFloat(a.amount)
    );
    const highestBid = sortedBids[0] || { amount: '0', bidder: ethers.ZeroAddress };

    const formattedAuction = {
      seller,
      nftContract,
      tokenId: tokenId.toString(),
      tokenURI,
      auctionType: auctionType.toString(),
      startingPrice: ethers.formatUnits(startingPrice, 18),
      reservePrice: ethers.formatUnits(reservePrice, 18),
      duration: duration.toString(),
      depositAmount: ethers.formatUnits(depositAmount, 18),
      startTime: startTime.toString(),
      endTime: endTime.toString(),
      highestBid: highestBid.amount,
      highestBidder: highestBid.bidder
    };

    return {
      success: true,
      data: {
        auctionDetails: formattedAuction,
        bidHistory: bids
      }
    };

  } catch (error) {
    console.error('Error fetching auction details and bids:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// 使用示例
export async function getAuctionDetailsAndBidsExample(
  provider: ethers.Provider,
  contractAddress: string,
  auctionId: string
) {
  const result = await getAuctionDetailsAndBids(provider, contractAddress, auctionId);
  
  if (result.success && result.data) {
    console.log('Auction Details:', result.data.auctionDetails);
    console.log('Bid History:', result.data.bidHistory);
  } else {
    console.error('Failed to fetch auction details and bids:', result.error);
  }
} 