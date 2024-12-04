import { ethers } from 'ethers';
import DANFTABI from '../abi/DANFT.json';
import { BlockchainService } from './blockchainService';

interface NFT {
  id: string;
  name: string;
  image: string;
  tokenId: string;
  owner: string;
  mintTime: number;
  contractAddress: string;
}

export class NFTService {
  private static instance: NFTService;
  private blockchainService: BlockchainService;

  private constructor() {
    this.blockchainService = BlockchainService.getInstance();
  }

  public static getInstance(): NFTService {
    if (!NFTService.instance) {
      NFTService.instance = new NFTService();
    }
    return NFTService.instance;
  }

  public async getNFTs(): Promise<NFT[]> {
    try {
      const provider = await this.blockchainService.getProvider();
      const contractAddress = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;

      if (!contractAddress) {
        throw new Error('NFT contract address not configured');
      }

      const contract = new ethers.Contract(contractAddress, DANFTABI.abi, provider);
      const latestBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, latestBlock - 10000);

      const filter = contract.filters.NFTMinted();
      const events = await contract.queryFilter(filter, fromBlock, latestBlock);
      
      const nfts = await Promise.all(events.map(async (event) => {
        const timestamp = await this.blockchainService.getBlockTimestamp(event.blockNumber);
        const args = event.args;
        
        return {
          id: args[0].toString(),
          name: `DA NFT #${args[0].toString()}`,
          image: args[2].replace('ipfs://', 'https://ipfs.io/ipfs/'),
          tokenId: args[0].toString(),
          owner: args[1],
          mintTime: Number(args[3].toString()),
          contractAddress: contractAddress
        };
      }));

      return nfts.sort((a, b) => b.mintTime - a.mintTime);
    } catch (error) {
      console.error('Failed to fetch NFTs:', error);
      throw error;
    }
  }

  public async getNFTDetails(tokenId: string): Promise<NFT> {
    try {
      const provider = await this.blockchainService.getProvider();
      const contractAddress = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;

      if (!contractAddress) {
        throw new Error('NFT contract address not configured');
      }

      const contract = new ethers.Contract(contractAddress, DANFTABI.abi, provider);
      const filter = contract.filters.NFTMinted(tokenId);
      const events = await contract.queryFilter(filter);

      if (events.length === 0) {
        throw new Error('NFT not found');
      }

      const event = events[0];
      const timestamp = await this.blockchainService.getBlockTimestamp(event.blockNumber);
      const args = event.args;

      return {
        id: args[0].toString(),
        name: `DA NFT #${args[0].toString()}`,
        image: args[2].replace('ipfs://', 'https://ipfs.io/ipfs/'),
        tokenId: args[0].toString(),
        owner: args[1],
        mintTime: Number(args[3].toString()),
        contractAddress: contractAddress
      };
    } catch (error) {
      console.error('Failed to fetch NFT details:', error);
      throw error;
    }
  }
} 