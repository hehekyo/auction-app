import { ethers } from 'ethers';
import AuctionManagerABI from '../abi/AuctionManager.json';
import { BlockchainService } from './blockchainService';

export interface AuctionStartedEvent {
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

export interface BidEvent {
  bidder: string;
  amount: string;
  timestamp: string;
}

export interface AuctionDetails {
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
  highestBid: string;
  highestBidder: string;
}

export class AuctionService {
  private static instance: AuctionService;
  private blockchainService: BlockchainService;

  private constructor() {
    this.blockchainService = BlockchainService.getInstance();
  }

  public static getInstance(): AuctionService {
    if (!AuctionService.instance) {
      AuctionService.instance = new AuctionService();
    }
    return AuctionService.instance;
  }

  private formatDATAmount(amount: bigint, decimals: number = 18): string {
    return ethers.formatUnits(amount, decimals);
  }

  // 获取拍卖列表
  public async getAuctions(): Promise<AuctionStartedEvent[]> {
    try {
      const provider = await this.blockchainService.getProvider();
      const contractAddress = process.env.NEXT_PUBLIC_AUCTION_CONTRACT_ADDRESS;
      
      if (!contractAddress) {
        throw new Error('Auction contract address not configured');
      }

      const contract = new ethers.Contract(contractAddress, AuctionManagerABI.abi, provider);
      const latestBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, latestBlock - 10000);

      console.log("============contract=============",contract);


      const events = await contract.queryFilter('AuctionStarted', fromBlock, latestBlock);
      console.log("============events=============",events);
      const formattedEvents = await Promise.all(events.map(async (event: any) => {
        const block = await provider.getBlock(event.blockNumber);
        const timestamp = block ? block.timestamp : null;

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

        return {
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber,
          timestamp,
          args: {
            auctionId: auctionId.toString(),
            seller,
            nftContract,
            tokenId: tokenId.toString(),
            tokenURI,
            auctionType: auctionType.toString(),
            startingPrice: this.formatDATAmount(startingPrice),
            reservePrice: this.formatDATAmount(reservePrice),
            duration: duration.toString(),
            depositAmount: this.formatDATAmount(depositAmount),
            startTime: startTime.toString(),
            endTime: endTime.toString()
          }
        };
      }));

      return formattedEvents;
    } catch (error) {
      console.error('Failed to fetch auctions:', error);
      throw error;
    }
  }

  // 获取拍卖详情
  public async getAuctionDetails(auctionId: string): Promise<{
    auctionDetails: AuctionDetails;
    bidHistory: BidEvent[];
  }> {
    try {
      const provider = await this.blockchainService.getProvider();
      const contractAddress = process.env.NEXT_PUBLIC_AUCTION_CONTRACT_ADDRESS;

      if (!contractAddress) {
        throw new Error('Auction contract address not configured');
      }

      const contract = new ethers.Contract(contractAddress, AuctionManagerABI.abi, provider);
      
      const auctionEvents = await contract.queryFilter('AuctionStarted');
      const auctionEvent = auctionEvents.find((event: any) => 
        event.args[0].toString() === auctionId
      );
      
      if (!auctionEvent) {
        throw new Error('Auction not found');
      }

      const [
        auctionIdArg,
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
      ] = auctionEvent.args;

      const bidEvents = await contract.queryFilter('BidPlaced');
      const auctionBidEvents = bidEvents.filter((event: any) => 
        event.args[0].toString() === auctionId
      );

      const bids = auctionBidEvents.map((event: any) => {
        const [, bidder, bidAmount, timestamp] = event.args;
        return {
          bidder,
          amount: this.formatDATAmount(bidAmount),
          timestamp: timestamp.toString()
        };
      });

      const sortedBids = [...bids].sort((a, b) => 
        parseFloat(b.amount) - parseFloat(a.amount)
      );
      const highestBid = sortedBids[0] || { amount: '0', bidder: ethers.ZeroAddress };

      const auctionDetails: AuctionDetails = {
        auctionId: auctionIdArg.toString(),
        seller,
        nftContract,
        tokenId: tokenId.toString(),
        tokenURI,
        auctionType: auctionType.toString(),
        startingPrice: this.formatDATAmount(startingPrice),
        reservePrice: this.formatDATAmount(reservePrice),
        duration: duration.toString(),
        depositAmount: this.formatDATAmount(depositAmount),
        startTime: startTime.toString(),
        endTime: endTime.toString(),
        highestBid: highestBid.amount,
        highestBidder: highestBid.bidder
      };

      return {
        auctionDetails,
        bidHistory: bids
      };
    } catch (error) {
      console.error('Failed to fetch auction details:', error);
      throw error;
    }
  }
} 