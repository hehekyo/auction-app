'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MdArrowBack } from 'react-icons/md';
import Image from 'next/image';
import { AuctionService } from '@/services/auctionService';
import { ethers } from 'ethers';

interface NFTInfo {
  tokenURI: string;
  exists: boolean;
  image: string;
  name: string;
}

export default function CreateAuctionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [auctionType, setAuctionType] = useState<'0' | '1'>('0');
  const [startingPrice, setStartingPrice] = useState(200);
  const [reservePrice, setReservePrice] = useState(180);
  const [duration, setDuration] = useState(120);
  const [nftContract, setNftContract] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [priceDecrement, setPriceDecrement] = useState(0);
  const [decrementInterval, setDecrementInterval] = useState(0);
  const [nftInfo, setNftInfo] = useState<NFTInfo | null>(null);
  const [nftError, setNftError] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  // 验证并授权 NFT
  const handleApproveNFT = async () => {
    if (!nftContract || !tokenId) {
      setNftError('Please enter NFT contract address and token ID');
      return;
    }

    setIsApproving(true);
    setNftError(null);
    try {
      const auctionService = AuctionService.getInstance();
      const metadata = await auctionService.approveNFT(nftContract, Number(tokenId));
      
      setNftInfo({
        tokenURI: metadata.tokenURI,
        exists: true,
        image: metadata.image,
        name: metadata.name
      });
      setIsApproved(true);
    } catch (error) {
      console.error('NFT approval failed:', error);
      setNftError(error instanceof Error ? error.message : 'Failed to approve NFT');
      setIsApproved(false);
    } finally {
      setIsApproving(false);
    }
  };

//   useEffect(() => {
//     if (nftContract && tokenId) {
//       handleApproveNFT();
//     }
//   }, [nftContract, tokenId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isApproved) {
      setNftError('Please approve NFT first');
      return;
    }

    setLoading(true);
    try {
      const auctionService = AuctionService.getInstance();
      const durationInSeconds = Math.floor(duration * 3600); // 转换小时为秒
      
      const txHash = await auctionService.createAuction(
        Number(auctionType),
        startingPrice,
        reservePrice,
        durationInSeconds,
        nftContract,
        Number(tokenId),
        priceDecrement,
        decrementInterval
      );
      
      console.log('Auction created successfully:', txHash);
      router.push('/auctions');
    } catch (error) {
      console.error('Error creating auction:', error);
      if (error instanceof Error) {
        if (error.message.includes('Please install MetaMask')) {
          alert('Please install MetaMask wallet\nVisit https://metamask.io/download/ to install');
        } else {
          alert(error.message);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <button
        onClick={() => router.push('/auctions')}
        className="mb-4 text-gray-400 hover:text-gray-300 flex items-center gap-2"
      >
        <MdArrowBack className="w-5 h-5" />
        Back to Auctions
      </button>

      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-100 mb-4 text-center">Create New Auction</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Auction Type */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-3">
              <label className={`
                flex flex-col items-center p-3 rounded-lg cursor-pointer transition-all
                ${auctionType === '0' 
                  ? 'bg-blue-600 ring-2 ring-blue-400' 
                  : 'bg-gray-600 hover:bg-gray-500'}
              `}>
                <input
                  type="radio"
                  value="0"
                  checked={auctionType === '0'}
                  onChange={(e) => setAuctionType(e.target.value as '0' | '1')}
                  className="sr-only"
                />
                <span className="text-lg font-bold text-white">English Auction</span>
                <span className="text-xs text-gray-200">Price starts low and increases</span>
              </label>
              
              <label className={`
                flex flex-col items-center p-3 rounded-lg cursor-pointer transition-all
                ${auctionType === '1' 
                  ? 'bg-blue-600 ring-2 ring-blue-400' 
                  : 'bg-gray-600 hover:bg-gray-500'}
              `}>
                <input
                  type="radio"
                  value="1"
                  checked={auctionType === '1'}
                  onChange={(e) => setAuctionType(e.target.value as '0' | '1')}
                  className="sr-only"
                />
                <span className="text-lg font-bold text-white">Dutch Auction</span>
                <span className="text-xs text-gray-200">Price starts high and decreases</span>
              </label>
            </div>
          </div>

          {/* NFT Selection */}
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-300 mb-1 text-sm font-medium">NFT Contract Address</label>
                  <input 
                    type="text"
                    value={nftContract}
                    onChange={(e) => {
                      setNftContract(e.target.value);
                      setIsApproved(false);
                    }}
                    className="w-full bg-gray-700 text-gray-100 rounded-lg p-2 text-sm border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="0x..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 text-sm font-medium">Token ID</label>
                  <input 
                    type="text"
                    value={tokenId}
                    onChange={(e) => {
                      setTokenId(e.target.value);
                      setIsApproved(false);
                    }}
                    className="w-full bg-gray-700 text-gray-100 rounded-lg p-2 text-sm border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <button
                  type="button"
                  onClick={handleApproveNFT}
                  disabled={isApproving || !nftContract || !tokenId}
                  className="w-full py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 
                    text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isApproving ? 'Approving...' : isApproved ? 'Approved ✓' : 'Approve NFT'}
                </button>

                {nftError && (
                  <div className="text-red-500 text-xs bg-red-500/10 p-2 rounded-lg">
                    {nftError}
                  </div>
                )}
              </div>

              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-700">
                {nftInfo?.image ? (
                  <Image
                    src={nftInfo.image}
                    alt={nftInfo.name || 'NFT Preview'}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                    {isApproving ? 'Loading...' : 'NFT Preview'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Auction Settings */}
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <label className="block text-gray-300 mb-1 text-sm font-medium">Starting Price (DAT)</label>
                <input 
                  type="number"
                  min="0"
                  step="0.01"
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(parseFloat(e.target.value))}
                  className="w-full bg-gray-700 text-gray-100 rounded-lg p-2 text-sm border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1 text-sm font-medium">Reserve Price (DAT)</label>
                <input 
                  type="number"
                  min="0"
                  step="0.01"
                  value={reservePrice}
                  onChange={(e) => setReservePrice(parseFloat(e.target.value))}
                  className="w-full bg-gray-700 text-gray-100 rounded-lg p-2 text-sm border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1 text-sm font-medium">Duration (hours)</label>
                <input 
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(parseFloat(e.target.value))}
                  className="w-full bg-gray-700 text-gray-100 rounded-lg p-2 text-sm border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Dutch Auction Specific Fields */}
            {auctionType === '1' && (
              <div className="grid md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-700">
                <div>
                  <label className="block text-gray-300 mb-1 text-sm font-medium">Price Decrement (DAT)</label>
                  <input 
                    type="number"
                    min="0"
                    step="0.01"
                    value={priceDecrement}
                    onChange={(e) => setPriceDecrement(parseFloat(e.target.value))}
                    className="w-full bg-gray-700 text-gray-100 rounded-lg p-2 text-sm border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 text-sm font-medium">Decrement Interval (Seconds)</label>
                  <input 
                    type="number"
                    min="0"
                    value={decrementInterval}
                    onChange={(e) => setDecrementInterval(parseInt(e.target.value))}
                    className="w-full bg-gray-700 text-gray-100 rounded-lg p-2 text-sm border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !isApproved}
            className="w-full py-3 rounded-xl text-base font-bold bg-gradient-to-r from-blue-600 to-blue-500 
              hover:from-blue-500 hover:to-blue-400 text-white transition-all disabled:opacity-50 
              disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading ? 'Creating...' : 'Create Auction'}
          </button>
        </form>
      </div>
    </div>
  );
} 