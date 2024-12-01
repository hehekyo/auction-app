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
    bidTimestamp: string;
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
    
    // 获取拍卖详情
    const auction = await contract.getAuction(auctionId);
    
    // 解构拍卖数据，确保只对需要格式化的数值使用 formatUnits
    const {
      seller,
      nftContract,
      tokenId,
      tokenURI,          // 这是字符串，不需要格式化
      auctionType,       // 这是数字，但不需要格式化
      startingPrice,     // 需要格式化
      reservePrice,      // 需要格式化
      duration,          // 这是数字，不需要格式化
      depositAmount,     // 需要格式化
      startTime,         // 这是时间戳，不需要格式化
      endTime,          // 这是时间戳，不需要格式化
      highestBid,       // 需要格式化
      highestBidder
    } = auction;

    const formattedAuction = {
      seller,
      nftContract,
      tokenId: tokenId.toString(),
      tokenURI,          // 直接使用字符串
      auctionType: auctionType.toString(),
      startingPrice: ethers.formatUnits(startingPrice, 18),
      reservePrice: ethers.formatUnits(reservePrice, 18),
      duration: duration.toString(),
      depositAmount: ethers.formatUnits(depositAmount, 18),
      startTime: startTime.toString(),
      endTime: endTime.toString(),
      highestBid: ethers.formatUnits(highestBid, 18),
      highestBidder
    };

    // 获取出价历史
    const bidFilter = contract.filters.BidPlaced(auctionId);
    const bidEvents = await contract.queryFilter(bidFilter);

    const bids = await Promise.all(
      bidEvents.map(async (event) => {
        const [, bidder, amount] = event.args!;
        return {
          bidder,
          amount: ethers.formatUnits(amount, 18),
          timestamp: (await event.getBlock()).timestamp
        };
      })
    );

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