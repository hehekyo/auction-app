'use client';

import { useState } from 'react';
import AuctionList from '@/components/AuctionList';
import CreateAuctionModal from '@/components/CreateAuctionModal';

export default function AuctionsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshAuctionList, setRefreshAuctionList] = useState(false);

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setRefreshAuctionList((prev) => !prev);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Current Auctions</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-500 transition"
        >
          Create Auction
        </button>
      </div>
      
      <AuctionList refresh={refreshAuctionList} />

      <CreateAuctionModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
      />
    </div>
  );
} 