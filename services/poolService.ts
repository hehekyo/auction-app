import { Address, getContract } from "viem";
import { usePublicClient } from "wagmi";
import FACTORY_ABI from "@/abi/UniswapV2Factory.json";

export class PoolService {
  private factoryContract;

  constructor(publicClient: any) {
    const factoryAddress = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as Address;
    if (!factoryAddress) {
      throw new Error("Factory contract address not configured");
    }

    this.factoryContract = getContract({
      address: factoryAddress,
      abi: FACTORY_ABI.abi,
      client: publicClient,
    });
  }

  async getAllPools() {
    try {
      const length = await this.factoryContract.read.allPairsLength();
      const pools = [];

      for (let i = 0; i < length; i++) {
        const pairAddress = await this.factoryContract.read.allPairs([i]);
        pools.push(pairAddress);
      }

      return pools;
    } catch (error) {
      console.error("Failed to get pools:", error);
      throw error;
    }
  }
}

export default new PoolService();
