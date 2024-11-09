'use client';

import { useState } from 'react';
import Navbar from '../components/Header';
import AuctionList from '../components/AuctionList';
import Footer from '../components/Footer';
import CreateAuctionModal from '../components/CreateAuctionModal';

export default function Home() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshAuctionList, setRefreshAuctionList] = useState(false);

  // 当模态窗口关闭时更新 refreshAuctionList，触发 AuctionList 重新加载
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setRefreshAuctionList((prev) => !prev); // 切换 refresh 状态
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto p-6 flex-grow">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Current Auctions</h2>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-500 transition"
          >
            Create Auction
          </button>
        </div>
        {/* 将 refreshAuctionList 传递给 AuctionList */}
        <AuctionList refresh={refreshAuctionList} />
      </div>
      <Footer />

      {/* Create Auction Modal */}
      <CreateAuctionModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
      />
    </div>
  );
}
