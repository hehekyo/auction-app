'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuctionCard from '@/components/AuctionCard';
import CreateAuctionModal from '@/components/CreateAuctionModal';
import { FaPlus } from 'react-icons/fa';

interface Auction {
  id: number;
  name: string;
  image: string;
  sellerAddress: string;
  minBid: number;
  highestBid?: number;
  highestBidder?: string;
  endTime: Date;
}

export default function AuctionsPage() {
  const router = useRouter();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await fetch('/api/auctions');
        if (!response.ok) {
          throw new Error('Failed to fetch auctions');
        }
        const data = await response.json();
        console.log("======fetchAuctions data",data.data);
        
        setAuctions(data.data);
      } catch (error) {
        console.error('Error fetching auctions:', error);
        setError('Failed to load auctions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  const handleViewDetail = (auctionId: number) => {
    router.push(`/auctions/${auctionId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl mb-4">😕</p>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Create Button */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-500"> NFT Auctions</h1>
        </div>
        
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg 
            hover:bg-blue-700 transition-colors"
        >
          <FaPlus className="w-4 h-4" />
          <span>Create Auction</span>
        </button>
      </div>

      {/* Auctions Grid */}
      {auctions.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <p className="mb-4">No active auctions at the moment</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Create Auction
          </button>
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

      {/* Create Auction Modal */}
      <CreateAuctionModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          // 可选：刷新拍卖列表
        //   fetchAuctions();
        }}
      />
    </div>
  );
} 