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

export interface NFTMetadata {
  name: string;
  image: string;
  tokenURI: string;
}

export class AuctionService {
  private static instance: AuctionService;
  private blockchainService: BlockchainService;
  private contract: ethers.Contract | null = null;
  private provider: ethers.BrowserProvider | null = null;

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

  private async resetHardhatNetwork(): Promise<void> {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x539' }]
      });

      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('当前网络 chainId:', currentChainId);

      await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      console.log('已切换到 Hardhat 网络');
    } catch (error: any) {
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x539',
            chainName: 'Hardhat Local',
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18
            },
            rpcUrls: ['http://127.0.0.1:8545']
          }]
        });
      } else {
        console.error('重置网络失败:', error);
        throw error;
      }
    }
  }

  private async getContract(): Promise<ethers.Contract> {
    try {
      if (!this.contract) {
        if (!window.ethereum) {
          throw new Error('请安装 MetaMask 钱包');
        }

        this.provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await this.provider.getSigner();
        const contractAddress = process.env.NEXT_PUBLIC_AUCTION_CONTRACT_ADDRESS;

        if (!contractAddress) {
          throw new Error('Auction contract address not configured');
        }
        
        this.contract = new ethers.Contract(
          contractAddress,
          AuctionManagerABI.abi,
          signer
        );
        console.log('合约实例创建成功');
      }
      return this.contract;
    } catch (error) {
      console.error('获取合约实例失败:', error);
      throw error;
    }
  }

  private async getNFTMetadata(tokenURI: string): Promise<NFTMetadata> {
    try {
      const url = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
      const response = await fetch(url);
      const metadata = await response.json();
      return {
        name: metadata.name || 'Unknown NFT',
        image: metadata.image?.replace('ipfs://', 'https://ipfs.io/ipfs/') || '',
        tokenURI
      };
    } catch (error) {
      console.error('Failed to fetch NFT metadata:', error);
      return {
        name: 'Unknown NFT',
        image: '',
        tokenURI
      };
    }
  }

  public async getNFTInfo(nftContract: string, tokenId: number): Promise<NFTMetadata> {
    try {
      const signer = await this.provider!.getSigner();
      const nftContractInstance = new ethers.Contract(
        nftContract,
        ['function tokenURI(uint256) view returns (string)'],
        signer
      );
      
      const tokenURI = await nftContractInstance.tokenURI(Number(tokenId));
      return await this.getNFTMetadata(tokenURI);
    } catch (error) {
      console.error('Failed to get NFT info:', error);
      throw error;
    }
  }

  public async approveNFT(nftContract: string, tokenId: number): Promise<NFTMetadata> {
    try {
      await this.resetHardhatNetwork();
      
      const contract = await this.getContract();
      const signer = await this.provider!.getSigner();
      const auctionAddress = await contract.getAddress();
      const signerAddress = await signer.getAddress();

      console.log('授权参数:', {
        nftContract,
        tokenId,
        auctionAddress,
        signerAddress
      });

      const nftContractInstance = new ethers.Contract(
        nftContract,
        [
          'function approve(address to, uint256 tokenId) public',
          'function getApproved(uint256 tokenId) view returns (address)',
          'function ownerOf(uint256) public view returns (address)',
          'function balanceOf(address) public view returns (uint256)',
          'function tokenURI(uint256) view returns (string)'
        ],
        signer
      );

      // 检查所有权
      const owner = await nftContractInstance.ownerOf(tokenId);
      if (owner.toLowerCase() !== signerAddress.toLowerCase()) {
        throw new Error(`你不是此 NFT 的所有者。所有者: ${owner}, 你的地址: ${signerAddress}`);
      }

      // 执行授权
      const tx = await nftContractInstance.approve(auctionAddress, tokenId);
      await tx.wait();

      // 验证授权
      const approved = await nftContractInstance.getApproved(tokenId);
      if (approved.toLowerCase() !== auctionAddress.toLowerCase()) {
        throw new Error('授权验证失败');
      }

      // 获取 NFT 元数据
      const tokenURI = await nftContractInstance.tokenURI(tokenId);
      return await this.getNFTMetadata(tokenURI);

    } catch (error: any) {
      console.error('NFT 授权失败:', error);
      throw error;
    }
  }

  public async createAuction(
    auctionType: number,
    startingPrice: number,
    reservePrice: number,
    duration: number,
    nftContract: string,
    tokenId: number,
    priceDecrement: number = 0,
    decrementInterval: number = 0
  ): Promise<string> {
    try {
      await this.resetHardhatNetwork();
      await this.approveNFT(nftContract, tokenId);

      const contract = await this.getContract();
      
      const startingPriceWei = ethers.parseEther(startingPrice.toString());
      const reservePriceWei = ethers.parseEther(reservePrice.toString());
      const priceDecrementWei = ethers.parseEther(priceDecrement.toString());

      console.log('创建拍卖参数:', {
        auctionType,
        startingPriceWei,
        reservePriceWei,
        duration,
        nftContract,
        tokenId,
        priceDecrementWei,
        decrementInterval
      });

      const tx = await contract.startAuction(
        auctionType,
        startingPriceWei,
        reservePriceWei,
        duration,
        nftContract,
        tokenId,
        priceDecrementWei,
        decrementInterval
      );

      const receipt = await tx.wait();
      console.log('拍卖创建成功，交易哈希:', tx.hash);
      return tx.hash;
    } catch (error) {
      console.error('创建拍卖失败:', error);
      throw error;
    }
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


      const events = await contract.queryFilter('AuctionStarted', fromBlock, latestBlock);
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