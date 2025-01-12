import { PublicClient, WalletClient, parseEther, Address } from "viem";
import adAllianceABI from "@/abi/AdAlliance.json";

export class AdAllianceService {
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

  async createAd(target: string, budget: string, costPerClick: string) {
    const parsedBudget = parseEther(budget);
    const parsedCostPerClick = parseEther(costPerClick);

    const hash = await this.walletClient.writeContract({
      address: this.contractAddress,
      abi: adAllianceABI.abi,
      functionName: "createAd",
      args: [target, parsedBudget, parsedCostPerClick],
    });
    return hash;
  }

  async getAd(adId: number) {
    const ad = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: adAllianceABI.abi,
      functionName: "ads",
      args: [adId],
    });
    return ad;
  }

  async getAdCount() {
    const count = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: adAllianceABI.abi,
      functionName: "adCount",
    });
    return count;
  }

  async generateLink(adId: number) {
    const hash = await this.walletClient.writeContract({
      address: this.contractAddress,
      abi: adAllianceABI.abi,
      functionName: "generateLink",
      args: [adId],
    });
    return hash;
  }

  async settleClicks(adId: number) {
    const hash = await this.walletClient.writeContract({
      address: this.contractAddress,
      abi: adAllianceABI.abi,
      functionName: "settleClicks",
      args: [adId],
    });
    return hash;
  }

  async updateAdStatus(adId: number, isActive: boolean, budget: string) {
    const parsedBudget = parseEther(budget);

    const hash = await this.walletClient.writeContract({
      address: this.contractAddress,
      abi: adAllianceABI.abi,
      functionName: "updateAd",
      args: [adId, isActive, parsedBudget],
    });
    return hash;
  }
}
