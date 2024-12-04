'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuctionCard from '@/components/AuctionCard';
import { FaPlus } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAuctions } from '@/store/auctionSlice';

export default function AuctionsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { auctions, loading, error } = useAppSelector((state) => state.auctions);

  useEffect(() => {
    dispatch(fetchAuctions());
  }, [dispatch]);

  const handleViewDetail = (auctionId: string) => {
    router.push(`/auctions/${auctionId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Create Button */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-500">NFT Auctions</h1>
        </div>
        
        <button
          onClick={() => router.push('/auctions/create')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg 
            hover:bg-blue-700 transition-colors"
        >
          <FaPlus className="w-4 h-4" />
          <span>Create Auction</span>
        </button>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-red-500 text-center">
            <p className="text-xl mb-4">😕</p>
            <p>{error}</p>
            <button 
              onClick={() => dispatch(fetchAuctions())} 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Retry
            </button>
          </div>
        </div>
      ) : auctions && auctions.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <p className="mb-4">No active auctions at the moment</p>
         
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {auctions.map((auction) => (
            <AuctionCard
              key={auction.args.auctionId}
              {...auction.args}
              onViewDetail={() => handleViewDetail(auction.args.auctionId)}
            />
          ))}
        </div>
      )}
    </div>
  );
} 