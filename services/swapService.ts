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
      const account = this.walletClient.account;
      if (!account) throw new Error("Wallet account not available");

      const { request } =
        await this.routerContract.simulate.swapExactETHForTokens(
          [amountOutMin, path, to, deadline],
          { account: account.address, value }
        );

      const hash = await this.walletClient.writeContract(request);
      return hash;
    } catch (error) {
      console.error("SwapExactETHForTokens failed:", error);
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
