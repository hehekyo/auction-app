import { Address, getContract, WalletClient, PublicClient } from "viem";
import ROUTER_ABI from "@/abi/UniswapV2Router.json";

export class SwapService {
  private routerContract;
  private walletClient: WalletClient;

  constructor(publicClient: PublicClient, walletClient: WalletClient) {
    const routerAddress = process.env.NEXT_PUBLIC_ROUTER_ADDRESS as Address;
    if (!routerAddress) {
      throw new Error("Router contract address not configured");
    }

    this.walletClient = walletClient;
    this.routerContract = getContract({
      address: routerAddress,
      abi: ROUTER_ABI.abi,
      client: publicClient,
      walletClient,
    });
  }

  async swapExactTokensForTokens({
    amountIn,
    amountOutMin,
    path,
    to,
    deadline,
  }: {
    amountIn: bigint;
    amountOutMin: bigint;
    path: Address[];
    to: Address;
    deadline: bigint;
  }) {
    try {
      const hash = await this.routerContract.write.swapExactTokensForTokens({
        amountIn,
        amountOutMin,
        path,
        to,
        deadline,
      });
      return hash;
    } catch (error) {
      console.error("Failed to swap tokens:", error);
      throw error;
    }
  }

  async swapExactETHForTokens({
    amountOutMin,
    path,
    to,
    deadline,
    value,
  }: {
    amountOutMin: bigint;
    path: Address[];
    to: Address;
    deadline: bigint;
    value: bigint;
  }) {
    try {
      if (!this.walletClient.account) {
        throw new Error("No account found in wallet client");
      }
      console.log("============swapExactETHForTokens====");
      console.log("============parameters", amountOutMin, path, to, deadline);

      const hash = await this.routerContract.write.swapExactETHForTokens(
        [amountOutMin, path, to, deadline],
        {
          value,
          account: this.walletClient.account,
        }
      );
      return hash;
    } catch (error) {
      console.error("Failed to swap ETH for tokens:", error);
      throw error;
    }
  }

  async getAmountsOut(amountIn: bigint, path: Address[]) {
    try {
      const amounts = await this.routerContract.read.getAmountsOut([
        amountIn,
        path,
      ]);
      return amounts;
    } catch (error) {
      console.error("Failed to get amounts out:", error);
      throw error;
    }
  }
}
