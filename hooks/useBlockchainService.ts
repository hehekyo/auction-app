import { useCallback } from "react";
import { ethers } from "ethers";
import { useWalletClient, usePublicClient } from "wagmi";

export function useBlockchainService() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const getProvider = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error("Please install MetaMask wallet");
    }
    return new ethers.BrowserProvider(window.ethereum);
  }, []);

  const getSigner = useCallback(async () => {
    const provider = await getProvider();
    const signer = await provider.getSigner();
    if (!signer) {
      throw new Error("Signer is not available. Please connect your wallet.");
    }
    return signer;
  }, [getProvider]);

  return {
    getProvider,
    getSigner,
    walletClient,
    publicClient,
  };
}
