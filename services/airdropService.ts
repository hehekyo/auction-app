import { PublicClient, WalletClient, parseEther, Address } from "viem";
import airdropABI from "@/abi/Airdrop.json";

export class AirdropService {
  private publicClient: PublicClient;
  private walletClient: WalletClient;
  private contractAddress: Address;

  constructor(
    publicClient: PublicClient,
    walletClient: WalletClient,
    contractAddress: Address
  ) {
    this.publicClient = publicClient;
    this.walletClient = walletClient;
    this.contractAddress = contractAddress;
  }

  async multiTransferETH(addresses: Address[], amounts: string[]) {
    const parsedAmounts = amounts.map((amount) => parseEther(amount));
    const totalAmount = parsedAmounts.reduce((a, b) => a + b, BigInt(0));

    const hash = await this.walletClient.writeContract({
      address: this.contractAddress,
      abi: airdropABI.abi,
      functionName: "multiTransferETH",
      args: [addresses, parsedAmounts],
      value: totalAmount,
    });
    return hash;
  }

  async multiTransferToken(
    tokenAddress: Address,
    addresses: Address[],
    amounts: string[]
  ) {
    const parsedAmounts = amounts.map((amount) => parseEther(amount));

    const hash = await this.walletClient.writeContract({
      address: this.contractAddress,
      abi: airdropABI.abi,
      functionName: "multiTransferToken",
      args: [tokenAddress, addresses, parsedAmounts],
    });
    return hash;
  }

  async withdrawFromFailList(to: Address) {
    const hash = await this.walletClient.writeContract({
      address: this.contractAddress,
      abi: airdropABI.abi,
      functionName: "withdrawFromFailList",
      args: [to],
    });
    return hash;
  }
}
