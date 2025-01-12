import { useMemo } from "react";
import { usePublicClient, useWalletClient } from "wagmi";
import { getContract, type GetContractReturnType, Address } from "viem";
import { publicClient, walletClient } from "./client";
import AUCTION_ABI from "../abi/EnglishAuction.json";

export function useContract(address: Address, abi: any) {
  return getContract({
    address,
    abi,
    client: publicClient,
  });
}

export function useAuctionContract() {
  const auctionAddress = process.env.NEXT_PUBLIC_AUCTION_CONTRACT_ADDRESS;
  if (!auctionAddress) {
    throw new Error("Auction contract address not configured");
  }

  return useContract(auctionAddress as Address, AUCTION_ABI.abi);
}
