import { ethers } from "ethers";
import TokenSwapABI from "../abi/TokenSwap.json";
import { BlockchainService } from "./blockchainService";

export class SwapService {
  private static instance: SwapService;
  private blockchainService: BlockchainService;
  private contract: ethers.Contract | null = null;

  private constructor() {
    this.blockchainService = BlockchainService.getInstance();
  }

  public static getInstance(): SwapService {
    if (!SwapService.instance) {
      SwapService.instance = new SwapService();
    }
    return SwapService.instance;
  }

  private async getContract(): Promise<ethers.Contract> {
    if (!this.contract) {
      const provider = await this.blockchainService.getProvider();
      const signer = provider.getSigner();
      const contractAddress = process.env.NEXT_PUBLIC_SWAP_CONTRACT_ADDRESS;

      if (!contractAddress) {
        throw new Error("Swap contract address not configured");
      }

      this.contract = new ethers.Contract(contractAddress, TokenSwapABI.abi, signer);
    }
    return this.contract;
  }

  public async swapTokens(amountIn: string, amountOutMin: string, path: string[], to: string, deadline: number): Promise<void> {
    try {
      const contract = await this.getContract();
      const tx = await contract.swapExactTokensForTokens(
        ethers.utils.parseUnits(amountIn, 18), // 假设代币有18位小数
        ethers.utils.parseUnits(amountOutMin, 18),
        path,
        to,
        deadline
      );
      await tx.wait();
      console.log("Swap transaction confirmed:", tx.hash);
    } catch (error) {
      console.error("Failed to swap tokens:", error);
      throw error;
    }
  }

  public async getAmountsOut(amountIn: string, path: string[]): Promise<string[]> {
    try {
      const contract = await this.getContract();
      const amounts = await contract.getAmountsOut(
        ethers.utils.parseUnits(amountIn, 18),
        path
      );
      return amounts.map(amount => ethers.utils.formatUnits(amount, 18));
    } catch (error) {
      console.error("Failed to get amounts out:", error);
      throw error;
    }
  }
} 