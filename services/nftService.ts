import { ethers } from "ethers";
import DANFTABI from "@/abi/DANFT.json";
import { BlockchainService } from "./blockchainService";

export interface NFTMetadata {
  id: string;
  name: string;
  description?: string;
  image: string;
  tokenId: string;
  contractAddress: string;
  owner?: string;
}

interface TokenData {
  tokenId: string;
  imageURI: string;
}

class NFTService {
  private static instance: NFTService;
  private blockchainService: BlockchainService;
  private contract: ethers.Contract | null = null;
  private DANFT_ADDRESS: string =
    process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || "";

  private constructor() {
    this.blockchainService = BlockchainService.getInstance();
  }

  public static getInstance(): NFTService {
    if (!NFTService.instance) {
      NFTService.instance = new NFTService();
    }
    return NFTService.instance;
  }

  private async getContract(): Promise<ethers.Contract> {
    if (!this.DANFT_ADDRESS) {
      throw new Error("Auction contract address not configured");
    }
    if (!this.contract) {
      const provider = await this.blockchainService.getProvider();
      this.contract = new ethers.Contract(
        this.DANFT_ADDRESS,
        DANFTABI.abi,
        provider
      );
    }
    return this.contract;
  }

  // 获取用户的 NFT 列表
  public async getNFTList(owner: string): Promise<NFTMetadata[]> {
    try {
      const contract = await this.getContract();
      console.log("=== nftService contract", contract);
      if (!this.DANFT_ADDRESS) {
        throw new Error("Auction contract address not configured");
      }

      // 使用 getMyTokens 方法获取用户的 NFT 列表
      console.log("=== nftService owner", owner);

      const tokens: TokenData[] = await contract.getMyTokens(owner);
      console.log("=== nftService tokens", tokens);
      // 转换返回的数据格式
      const nfts: NFTMetadata[] = tokens.map((token) => ({
        id: token.tokenId.toString(),
        name: `NFT #${token.tokenId}`,
        image: token.imageURI.replace("ipfs://", "https://ipfs.io/ipfs/"),
        tokenId: token.tokenId.toString(),
        contractAddress: this.DANFT_ADDRESS,
        owner,
      }));

      return nfts;
    } catch (error) {
      console.error("Failed to get NFT list:", error);
      throw this.handleError(error);
    }
  }

  // 获取单个 NFT 详情
  public async getNFTDetail(tokenId: string): Promise<NFTMetadata> {
    try {
      const contract = await this.getContract();

      // 获取 NFT 所有者
      const owner = await contract.ownerOf(tokenId);

      // 获取 NFT 的 URI
      const imageURI = await contract.tokenURI(tokenId);

      return {
        id: tokenId,
        name: `NFT #${tokenId}`,
        image: imageURI.replace("ipfs://", "https://ipfs.io/ipfs/"),
        tokenId: tokenId,
        contractAddress: this.DANFT_ADDRESS,
        owner,
      };
    } catch (error) {
      console.error("Failed to get NFT detail:", error);
      throw this.handleError(error);
    }
  }

  // 检查 NFT 是否已授权给拍卖合约
  public async isApprovedForAuction(
    tokenId: string,
    auctionAddress: string
  ): Promise<boolean> {
    try {
      const contract = await this.getContract();
      const approved = await contract.getApproved(tokenId);
      return approved.toLowerCase() === auctionAddress.toLowerCase();
    } catch (error) {
      console.error("Failed to check NFT approval:", error);
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.code === "CALL_EXCEPTION") {
      return new Error("NFT does not exist");
    }
    if (error.message.includes("ERC721: invalid token ID")) {
      return new Error("Invalid token ID");
    }
    if (error.message.includes("ERC721: owner query for nonexistent token")) {
      return new Error("NFT does not exist");
    }
    return error;
  }
}

export default NFTService;
