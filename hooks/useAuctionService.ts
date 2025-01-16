import { useCallback, useMemo } from "react";
import { ethers } from "ethers";
import {
  useEnglishAuctionContract,
  useDATokenContract,
  useDANFTContract,
} from "./useContract";
import { useBlockchainService } from "./useBlockchainService";
import { AuctionCreated, BidEvent, NFTMetadata } from "../types/auction";

export function useAuctionService() {
  const auctionContract = useEnglishAuctionContract();
  const datContract = useDATokenContract();
  const nftContract = useDANFTContract();
  const { getProvider, getSigner } = useBlockchainService();

  // 工具函数
  const toWei = useCallback((amount: string | number): bigint => {
    return ethers.parseEther(amount.toString());
  }, []);

  const fromWei = useCallback((amount: bigint): string => {
    return ethers.formatEther(amount);
  }, []);

  // NFT 相关方法
  const getNFTMetadata = useCallback(
    async (tokenURI: string): Promise<NFTMetadata> => {
      try {
        const url = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
        return {
          name: "NFT #1",
          image: url,
          tokenURI: url,
        };
      } catch (error) {
        console.error("Failed to get NFT metadata:", error);
        return {
          name: "Unknown NFT",
          image: "",
          tokenURI,
        };
      }
    },
    []
  );

  // 拍卖相关方法
  const createAuction = useCallback(
    async (
      nftAddress: string,
      tokenId: number,
      startingPrice: number,
      duration: number
    ): Promise<string> => {
      if (!auctionContract) throw new Error("Auction contract not initialized");

      const startingPriceWei = toWei(startingPrice);

      // 检查 NFT 所有权和授权
      const signer = await getSigner();
      const signerAddress = await signer.getAddress();
      const owner = await nftContract?.ownerOf(tokenId);

      if (owner?.toLowerCase() !== signerAddress.toLowerCase()) {
        throw new Error("您不是此 NFT 的所有者");
      }

      const tx = await auctionContract.createAuction(
        nftAddress,
        tokenId,
        startingPriceWei,
        duration
      );
      const receipt = await tx.wait();
      return tx.hash;
    },
    [auctionContract, nftContract, toWei, getSigner]
  );

  const bid = useCallback(
    async (
      nftAddress: string,
      tokenId: number,
      bidAmount: string
    ): Promise<void> => {
      if (!auctionContract || !datContract) {
        throw new Error("Contracts not initialized");
      }

      const bidAmountWei = toWei(bidAmount);
      const auctionAddress = await auctionContract.getAddress();
      const signer = await getSigner();
      const signerAddress = await signer.getAddress();

      // 检查授权
      const allowance = await datContract.allowance(
        signerAddress,
        auctionAddress
      );
      if (allowance < bidAmountWei) {
        const approveTx = await datContract.approve(
          auctionAddress,
          bidAmountWei
        );
        await approveTx.wait();
      }

      // 进行出价
      const tx = await auctionContract.bid(nftAddress, tokenId, bidAmountWei);
      await tx.wait();
    },
    [auctionContract, datContract, toWei, getSigner]
  );

  const getAuctions = useCallback(async (): Promise<AuctionCreated[]> => {
    if (!auctionContract) throw new Error("Auction contract not initialized");

    const provider = await getProvider();
    const latestBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, latestBlock - 1000);

    const filter = auctionContract.filters.AuctionCreated();
    const events = await auctionContract.queryFilter(filter, fromBlock);

    const auctions = await Promise.all(
      events.map(async (event: any) => {
        const [nftAddress, tokenId] = event.args;
        const auction = await auctionContract.getAuction(nftAddress, tokenId);
        const { tokenURI } = await getNFTMetadata(
          await nftContract?.tokenURI(tokenId)
        );

        return {
          auctionType: "0",
          transactionHash: event.transactionHash,
          auctionId: `${nftAddress}-${tokenId}`,
          seller: auction.seller,
          nftAddress: auction.nftAddress,
          tokenId: auction.tokenId.toString(),
          tokenURI,
          startingAt: auction.startingAt.toString(),
          endingAt: auction.endingAt.toString(),
          startingPrice: fromWei(auction.startingPrice),
          highestBid: fromWei(auction.highestBid),
          highestBidder: auction.highestBidder,
          bidders: auction.bidders.map((bid: any) => ({
            bidder: bid.bidder,
            bidAmount: fromWei(bid.bidAmount),
            bidTime: bid.bidTime.toString(),
          })),
          status: auction.status.toString(),
        };
      })
    );

    return auctions;
  }, [auctionContract, nftContract, getProvider, getNFTMetadata, fromWei]);

  // 返回所有可用方法
  return useMemo(
    () => ({
      createAuction,
      bid,
      getAuctions,
      getNFTMetadata,
      // ... 其他方法
    }),
    [createAuction, bid, getAuctions, getNFTMetadata]
  );
}
