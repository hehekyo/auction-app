import { PublicClient, WalletClient, parseEther, Address } from "viem";
import { erc20ABI } from "wagmi";

export class SendService {
  private publicClient: PublicClient;
  private walletClient: WalletClient;

  constructor(publicClient: PublicClient, walletClient: WalletClient) {
    this.publicClient = publicClient;
    this.walletClient = walletClient;
  }

  async sendETH(to: Address, amount: string) {
    const value = parseEther(amount);
    const hash = await this.walletClient.sendTransaction({
      to,
      value,
    });
    return hash;
  }

  async sendToken(tokenAddress: Address, to: Address, amount: string) {
    const value = parseEther(amount);
    const hash = await this.walletClient.writeContract({
      address: tokenAddress,
      abi: erc20ABI,
      functionName: "transfer",
      args: [to, value],
    });
    return hash;
  }

  async getTokenBalance(tokenAddress: Address, address: Address) {
    const balance = await this.publicClient.readContract({
      address: tokenAddress,
      abi: erc20ABI,
      functionName: "balanceOf",
      args: [address],
    });
    return balance;
  }

  async getETHBalance(address: Address) {
    const balance = await this.publicClient.getBalance({
      address,
    });
    return balance;
  }
}
