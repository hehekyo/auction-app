"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchAuctions } from "@/store/auctionSlice";
import Image from "next/image";
import { formatDistance } from "date-fns";

export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { auctions, loading: loadingAuctions } = useSelector(
    (state) => state.auctions
  );
  const [currentAuctionIndex, setCurrentAuctionIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 获取拍卖数据
        dispatch(fetchAuctions());
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

  // NFT 自动轮播
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAuctionIndex((prev) => (prev + 1) % auctions.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [auctions.length]);

  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold mb-6">Welcome to DAuction</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
        A decentralized auction platform supporting ETH and DAT token trading
      </p>

      {/* Carousels Container */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex overflow-x-auto space-x-4">
          {loadingAuctions ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          ) : auctions.active && auctions.active.length > 0 ? (
            auctions.active.map((auction, index) => (
              <div
                key={auction.auctionId}
                className={`flex-shrink-0 w-80 bg-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-transform ${
                  index === currentAuctionIndex ? "scale-105" : ""
                }`}
              >
                {/* NFT Image */}
                <div className="relative aspect-square">
                  <Image
                    src={auction.tokenURI}
                    alt={auction.auctionId}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform"
                  />
                  {/* Status Badge */}
                  <div
                    className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                      auction.status === "1"
                        ? "bg-green-500 text-white"
                        : "bg-gray-500 text-white"
                    }`}
                  >
                    {auction.status === "1" ? "Active" : "Ended"}
                  </div>
                </div>

                {/* Auction Info */}
                <div className="p-4 space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type</span>
                      <span className="text-gray-200">
                        {auction.auctionType === "0" ? "English" : "Dutch"}{" "}
                        Auction
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-400">Starting Price</span>
                      <span className="text-gray-200">
                        {auction.startingPrice} DAT
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-400">NFT Contract</span>
                      <span className="text-gray-200">
                        {auction.nftAddress}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-400">Token ID</span>
                      <span className="text-gray-200">#{auction.tokenId}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-400">Highest Bid</span>
                      <span className="text-gray-200">
                        {auction.highestBid || "No bids"} DAT
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-400">Ends In</span>
                      <span className="text-gray-200">
                        {formatDistance(
                          new Date(Number(auction.endingAt) * 1000),
                          new Date(),
                          { addSuffix: true }
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-400">No active auctions</div>
          )}
        </div>
      </div>

      {/* About DAT Token */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6 mt-12 mb-8 max-w-3xl mx-auto">
        <h3 className="text-xl font-semibold mb-2">About DAT Token</h3>
        <p className="text-gray-600 dark:text-gray-300">
          DAT (DAuction Token) is the token issued by our platform. It can be
          exchanged for ETH, and its price is dynamically adjusted using a price
          oracle.
        </p>
      </div>
    </div>
  );
}
