import { ethers, formatEther } from 'ethers';
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
    const currentBlock = await provider.getBlockNumber();

    const auctionIdBigInt = ethers.getBigInt(auctionId);

    // 获取 AuctionStarted 事件
    const auctionStartedFilter = contract.filters.AuctionStarted(
      auctionIdBigInt
    );
    const auctionStartedEvents = await contract.queryFilter(auctionStartedFilter, 0, currentBlock);

    if (auctionStartedEvents.length === 0) {
      throw new Error(`No auction found with ID ${auctionId}`);
    }

    // 获取最新的拍卖创建事件，使用不同的变量名
    const auctionEvent = auctionStartedEvents[0];
    const [
      eventAuctionId,  // 改变变量名避免冲突
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
    ] = auctionEvent.args as [
      ethers.BigNumber,
      string,
      string,
      ethers.BigNumber,
      ethers.BigNumber,
      ethers.BigNumber,
      ethers.BigNumber,
      ethers.BigNumber,
      ethers.BigNumber,
      ethers.BigNumber,
      ethers.BigNumber
    ];

    // 获取竞价事件
    const bidFilter = contract.filters.BidPlaced(
      auctionIdBigInt
    );
    const bidEvents = await contract.queryFilter(bidFilter, 0, currentBlock);

    // 格式化竞价事件
    const formattedBids: BidPlacedEvent[] = await Promise.all(
      bidEvents.map(async event => {
        const [
          bidEventAuctionId,  // 这里也使用不同的变量名
          bidder,
          bidAmount,
          bidTimestamp
        ] = event.args as [
          ethers.BigNumber,
          string,
          ethers.BigNumber,
          ethers.BigNumber
        ];

        const blockTimestamp = await getBlockTimestamp(provider, event.blockNumber);

        return {
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber,
          timestamp: blockTimestamp,
          args: {
            auctionId: bidEventAuctionId.toString(),
            bidder,
            bidAmount: formatEther(bidAmount),
            bidTimestamp: bidTimestamp.toString()
          }
        };
      })
    );

    // 按时间戳排序（最新的在前）
    const sortedBids = formattedBids.sort((a, b) => {
      const timeA = Number(a.args.bidTimestamp);
      const timeB = Number(b.args.bidTimestamp);
      return timeB - timeA;
    });

    // 获取最高出价信息（如果有出价的话）
    const highestBid = sortedBids.length > 0 ? sortedBids[0] : null;

    // 格式化拍卖详情
    const formattedAuctionDetails: AuctionDetails = {
      auctionId: eventAuctionId.toString(),  // 使用新的变量名
      seller,
      nftContract,
      tokenId: tokenId.toString(),
      startingPrice: formatEther(startingPrice),
      reservePrice: formatEther(reservePrice),
      minBidIncrement: formatEther(minBidIncrement),
      duration: duration.toString(),
      startTime: startTime.toString(),
      endTime: endTime.toString(),
      highestBid: highestBid ? highestBid.args.bidAmount : formatEther(initialBid),
      highestBidder: highestBid ? highestBid.args.bidder : seller,
      status: new Date().getTime() / 1000 > Number(endTime) ? 'ended' : 'active'
    };

    return {
      success: true,
      data: {
        auctionDetails: formattedAuctionDetails,
        bidHistory: sortedBids
      }
    };

  } catch (error: any) {
    console.error('Error fetching auction details and bids:', error);
    return {
      success: false,
      error: error.message
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