import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuctionService } from "../useAuctionService";
import { AuctionCreated, NFTMetadata } from "../../types/auction";

export function useAuctionQueries() {
  const queryClient = useQueryClient();
  const { createAuction, bid, getAuctions, getNFTMetadata } =
    useAuctionService();

  // 获取所有拍卖
  const useAuctions = () => {
    return useQuery<AuctionCreated[]>({
      queryKey: ["auctions"],
      queryFn: getAuctions,
    });
  };

  // 获取单个拍卖详情
  const useAuctionDetail = (auctionId: string) => {
    return useQuery<AuctionCreated>({
      queryKey: ["auction", auctionId],
      queryFn: () =>
        getAuctions().then((auctions) =>
          auctions.find((auction) => auction.auctionId === auctionId)
        ),
    });
  };

  // 创建拍卖
  const useCreateAuction = () => {
    return useMutation({
      mutationFn: (params: {
        nftAddress: string;
        tokenId: number;
        startingPrice: number;
        duration: number;
      }) =>
        createAuction(
          params.nftAddress,
          params.tokenId,
          params.startingPrice,
          params.duration
        ),
      onSuccess: () => {
        // 创建成功后刷新拍卖列表
        queryClient.invalidateQueries({ queryKey: ["auctions"] });
      },
    });
  };

  // 出价
  const useBid = () => {
    return useMutation({
      mutationFn: (params: {
        nftAddress: string;
        tokenId: number;
        bidAmount: string;
      }) => bid(params.nftAddress, params.tokenId, params.bidAmount),
      onSuccess: (_, variables) => {
        // 出价成功后刷新相关数据
        queryClient.invalidateQueries({ queryKey: ["auctions"] });
        queryClient.invalidateQueries({
          queryKey: ["auction", `${variables.nftAddress}-${variables.tokenId}`],
        });
      },
    });
  };

  // 获取 NFT 元数据
  const useNFTMetadata = (tokenURI: string) => {
    return useQuery<NFTMetadata>({
      queryKey: ["nft-metadata", tokenURI],
      queryFn: () => getNFTMetadata(tokenURI),
    });
  };

  return {
    useAuctions,
    useAuctionDetail,
    useCreateAuction,
    useBid,
    useNFTMetadata,
  };
}
