'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaEthereum, FaArrowRight, FaGavel } from 'react-icons/fa';

interface NFT {
  id: string;
  name: string;
  image: string;
  price: string;
  tokenId: string;
}

interface Auction {
  id: string;
  name: string;
  image: string;
  currentBid: string;
  endTime: string;
  description: string;
}

export default function Home() {
  const router = useRouter();
  const [latestNFTs, setLatestNFTs] = useState<NFT[]>([]);
  const [latestAuctions, setLatestAuctions] = useState<Auction[]>([]);
  const [currentNFT, setCurrentNFT] = useState(0);
  const [currentAuction, setCurrentAuction] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 获取最新 NFTs
        const nftResponse = await fetch('/api/nfts');
        const auctionResponse = await fetch('/api/auctions');
        
        if (nftResponse.ok && auctionResponse.ok) {
          const nftData = await nftResponse.json();
          const auctionData = await auctionResponse.json();
          setLatestNFTs(nftData.slice(0, 4));
          setLatestAuctions(auctionData.slice(0, 4));
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // NFT 自动轮播
  useEffect(() => {
    if (latestNFTs.length === 0) return;

    const interval = setInterval(() => {
      setCurrentNFT((prev) => (prev + 1) % latestNFTs.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [latestNFTs.length]);

  // 拍卖自动轮播
  useEffect(() => {
    if (latestAuctions.length === 0) return;

    const interval = setInterval(() => {
      setCurrentAuction((prev) => (prev + 1) % latestAuctions.length);
    }, 4000); // 设置不同的时间间隔，避免两个轮播同步

    return () => clearInterval(interval);
  }, [latestAuctions.length]);

  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold mb-6">Welcome to DAuction</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
        A decentralized auction platform supporting ETH and DAT token trading
      </p>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto px-4 mb-12">
        <div className="bg-gray-800/70 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
          <h2 className="text-2xl font-bold mb-4 text-white">Token Swap</h2>
          <p className="text-gray-400 mb-4">Quick and easy exchange between ETH and DAT</p>
          <a href="/swap" className="inline-block bg-blue-600/90 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
            Start Swapping
          </a>
        </div>
        <div className="bg-gray-800/70 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
          <h2 className="text-2xl font-bold mb-4 text-white">NFT Auctions</h2>
          <p className="text-gray-400 mb-4">Participate in NFT auctions and discover unique digital artworks</p>
          <a href="/auctions" className="inline-block bg-blue-600/90 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
            Browse Auctions
          </a>
        </div>
      </div>

      {/* Carousels Container */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Latest Auctions Carousel */}
           <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-left">Live Auctions</h2>
              <button
                onClick={() => router.push('/auctions')}
                className="flex items-center gap-2 text-blue-500 hover:text-blue-400 transition-colors"
              >
                View All <FaArrowRight />
              </button>
            </div>

            <div className="relative aspect-[4/3] bg-gray-800/70 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : latestAuctions.length > 0 ? (
                <>
                  {/* Auction Image */}
                  <div className="relative h-full transition-opacity duration-500">
                    <Image
                      src={latestAuctions[currentAuction]?.image || ''}
                      alt={latestAuctions[currentAuction]?.name || ''}
                      fill
                      className="object-cover"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* Auction Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {latestAuctions[currentAuction]?.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FaGavel className="text-yellow-400" />
                          <span className="text-white">
                            Current Bid: {latestAuctions[currentAuction]?.currentBid} ETH
                          </span>
                        </div>
                        <span className="text-yellow-400">
                          Ends in: {latestAuctions[currentAuction]?.endTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dots Indicator */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {latestAuctions.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentAuction(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentAuction ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  No active auctions
                </div>
              )}
            </div>
          </div>
          {/* Latest NFTs Carousel */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-left">Latest NFTs</h2>
              <button
                onClick={() => router.push('/nfts')}
                className="flex items-center gap-2 text-blue-500 hover:text-blue-400 transition-colors"
              >
                View All <FaArrowRight />
              </button>
            </div>

            <div className="relative aspect-[4/3] bg-gray-800/70 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : latestNFTs.length > 0 ? (
                <>
                  {/* NFT Image */}
                  <div className="relative h-full transition-opacity duration-500">
                    <Image
                      src={latestNFTs[currentNFT]?.image || ''}
                      alt={latestNFTs[currentNFT]?.name || ''}
                      fill
                      className="object-cover"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* NFT Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {latestNFTs[currentNFT]?.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <FaEthereum className="text-blue-400" />
                        <span className="text-white">
                          {latestNFTs[currentNFT]?.price} ETH
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dots Indicator */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {latestNFTs.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentNFT(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentNFT ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  No NFTs available
                </div>
              )}
            </div>
          </div>

         
        </div>
      </div>

      {/* About DAT Token */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6 mt-12 mb-8 max-w-3xl mx-auto">
        <h3 className="text-xl font-semibold mb-2">About DAT Token</h3>
        <p className="text-gray-600 dark:text-gray-300">
          DAT (DAuction Token) is the token issued by our platform. It can be exchanged for ETH, 
          and its price is dynamically adjusted using a price oracle.
        </p>
      </div>
    </div>
  );
}