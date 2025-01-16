import { useMemo } from "react";
import { Abi, Address, WalletClient } from "viem";
import { useChainId, useWalletClient } from "wagmi";
import { getContract } from "../utils/contractHelper";

// ABI JSON import
import englishAuctionAbi from "../abi/EnglishAuction.json";
import adAllianceAbi from "../abi/AdAlliance.json";
import danftAbi from "../abi/DANFT.json";
import airdropAbi from "../abi/Airdrop.json";
import auctionManagerAbi from "../abi/AuctionManager.json";
import datTokenAbi from "../abi/DAToken.json";
import dutchAuctionAbi from "../abi/DutchAuction.json";
import tokenSwapAbi from "../abi/TokenSwap.json";
import uniswapV2FactoryAbi from "../abi/UniswapV2Factory.json";
import uniswapV2PairAbi from "../abi/UniswapV2Pair.json";
import uniswapV2ERC20Abi from "../abi/UniswapV2ERC20.json";

import {
  AUCTION_ADDRESS,
  NFT_ADDRESS,
  DAT_ADDRESS,
  WETH_ADDRESS,
  FACTORY_ADDRESS,
  ROUTER_ADDRESS,
  QUERY_ADDRESS,
} from "../utils/constants";

type UseContractOptions = {
  chainId?: number;
};

export function useContract<TAbi extends Abi>(
  addressOrAddressMap?: Address | { [chainId: number]: Address },
  abi?: TAbi,
  options?: UseContractOptions
) {
  const currentChainId = useChainId();
  const chainId = options?.chainId || currentChainId;
  const { data: walletClient } = useWalletClient();

  return useMemo(() => {
    if (!addressOrAddressMap || !abi || !chainId) return null;
    let address: Address | undefined;
    if (typeof addressOrAddressMap === "string") address = addressOrAddressMap;
    else address = addressOrAddressMap[chainId];
    if (!address) return null;
    try {
      return getContract({
        abi,
        address,
        chainId,
        signer: walletClient ?? undefined,
      });
    } catch (error) {
      console.error("Failed to get contract", error);
      return null;
    }
  }, [addressOrAddressMap, abi, chainId, walletClient]);
}

export const useEnglishAuctionContract = () => {
  return useContract(AUCTION_ADDRESS, englishAuctionAbi.abi as Abi);
};

export const useDATokenContract = () => {
  return useContract(DAT_ADDRESS, datTokenAbi.abi as Abi);
};

export const useDANFTContract = () => {
  return useContract(NFT_ADDRESS, danftAbi.abi as Abi);
};

export const useAdAllianceContract = () => {
  return useContract(AUCTION_ADDRESS, adAllianceAbi.abi as Abi);
};

export const useAirdropContract = () => {
  return useContract(DAT_ADDRESS, airdropAbi.abi as Abi);
};

// export const useUniswapV2FactoryContract = () => {
//   return useContract(FACTORY_ADDRESS, uniswapV2FactoryAbi.abi as Abi);
// };

// export const useDutchAuctionContract = () => {
//   return useContract(NFT_ADDRESS, dutchAuctionAbi.abi as Abi);
// };

export const useTokenSwapContract = () => {
  return useContract(WETH_ADDRESS, tokenSwapAbi.abi as Abi);
};

export const useUniswapV2FactoryContract = () => {
  return useContract(FACTORY_ADDRESS, uniswapV2FactoryAbi.abi as Abi);
};

// export const useUniswapV2PairContract = () => {
//   return useContract(FACTORY_ADDRESS, uniswapV2PairAbi.abi as Abi);
// };

// export const useUniswapV2ERC20Contract = () => {
//   return useContract(FACTORY_ADDRESS, uniswapV2ERC20Abi.abi as Abi);
// };
