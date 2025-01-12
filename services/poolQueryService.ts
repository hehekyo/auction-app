import { Address, getContract } from "viem";
import QUERY_ABI from "@/abi/UniswapV2Query.json";

export interface PairInfo {
  pair: Address;
  token0: Address;
  token1: Address;
  reserve0: bigint;
  reserve1: bigint;
  totalSupply: bigint;
}

export class PoolQueryService {
  private queryContract;

  constructor(publicClient: any) {
    const queryAddress = process.env.NEXT_PUBLIC_QUERY_ADDRESS as Address;
    if (!queryAddress) {
      throw new Error("Query contract address not configured");
    }

    this.queryContract = getContract({
      address: queryAddress,
      abi: QUERY_ABI.abi,
      client: publicClient,
    });
  }

  async getAllPairsInfo(): Promise<PairInfo[]> {
    try {
      const pairsInfo = await this.queryContract.read.getAllPairsInfo();
      return pairsInfo;
    } catch (error) {
      console.error("Failed to get pairs info:", error);
      throw error;
    }
  }

  async getPairInfo(tokenA: Address, tokenB: Address): Promise<PairInfo> {
    try {
      const pairInfo = await this.queryContract.read.getPairInfo([
        tokenA,
        tokenB,
      ]);
      return pairInfo;
    } catch (error) {
      console.error("Failed to get pair info:", error);
      throw error;
    }
  }
}
