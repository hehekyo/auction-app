'use client'

import { useState,useEffect } from 'react';
import Navbar from '../components/Header';
import AuctionCard from '../components/AuctionCard';
import Footer from '../components/Footer';
import AuctionModal from '../components/AuctionModal';

type Auction = {
  id: number;
  sellerAddress: string;
  minBid: number;
  highestBid?: number;
  highestBidder?: string;
  endTime: Date;
  bids: {
    id: number;
    bidderAddress: string;
    bidAmount: number;
    bidTime: Date;
  }[];
};

export default function Home() {

  const mockAuctions: Auction[] = [
    {
      id: 1,
      sellerAddress: "0xSellerAddress1",
      minBid: 1.5,
      highestBid: 2.3,
      highestBidder: "0xHighestBidder1",
      endTime: new Date(Date.now() + 3600 * 1000), // 1 hour from now
      bids: [
        { id: 1, bidderAddress: "0xBidder1", bidAmount: 1.8, bidTime: new Date(Date.now() - 10000) },
        { id: 2, bidderAddress: "0xBidder2", bidAmount: 2.0, bidTime: new Date(Date.now() - 5000) },
        { id: 3, bidderAddress: "0xBidder3", bidAmount: 2.3, bidTime: new Date() },
      ],
    },
    {
      id: 2,
      sellerAddress: "0xSellerAddress2",
      minBid: 0.5,
      highestBid: 1.2,
      highestBidder: "0xHighestBidder2",
      endTime: new Date(Date.now() + 2 * 3600 * 1000), // 2 hours from now
      bids: [
        { id: 1, bidderAddress: "0xBidder4", bidAmount: 0.6, bidTime: new Date(Date.now() - 20000) },
        { id: 2, bidderAddress: "0xBidder5", bidAmount: 1.2, bidTime: new Date(Date.now() - 15000) },
      ],
    },
    {
      id: 3,
      sellerAddress: "0xSellerAddress3",
      minBid: 2.0,
      highestBid: 2.8,
      highestBidder: "0xHighestBidder3",
      endTime: new Date(Date.now() + 3 * 3600 * 1000), // 3 hours from now
      bids: [
        { id: 1, bidderAddress: "0xBidder6", bidAmount: 2.1, bidTime: new Date(Date.now() - 20000) },
        { id: 2, bidderAddress: "0xBidder7", bidAmount: 2.5, bidTime: new Date(Date.now() - 10000) },
        { id: 3, bidderAddress: "0xBidder8", bidAmount: 2.8, bidTime: new Date() },
      ],
    },
    {
      id: 4,
      sellerAddress: "0xSellerAddress4",
      minBid: 1.0,
      highestBid: 1.7,
      highestBidder: "0xHighestBidder4",
      endTime: new Date(Date.now() + 4 * 3600 * 1000), // 4 hours from now
      bids: [
        { id: 1, bidderAddress: "0xBidder9", bidAmount: 1.5, bidTime: new Date(Date.now() - 15000) },
        { id: 2, bidderAddress: "0xBidder10", bidAmount: 1.7, bidTime: new Date(Date.now() - 5000) },
      ],
    },
    {
      id: 5,
      sellerAddress: "0xSellerAddress5",
      minBid: 3.0,
      highestBid: 3.6,
      highestBidder: "0xHighestBidder5",
      endTime: new Date(Date.now() + 5 * 3600 * 1000), // 5 hours from now
      bids: [
        { id: 1, bidderAddress: "0xBidder11", bidAmount: 3.3, bidTime: new Date(Date.now() - 25000) },
        { id: 2, bidderAddress: "0xBidder12", bidAmount: 3.6, bidTime: new Date(Date.now() - 10000) },
      ],
    },
    {
      id: 6,
      sellerAddress: "0xSellerAddress6",
      minBid: 1.2,
      highestBid: 1.9,
      highestBidder: "0xHighestBidder6",
      endTime: new Date(Date.now() + 6 * 3600 * 1000), // 6 hours from now
      bids: [
        { id: 1, bidderAddress: "0xBidder13", bidAmount: 1.5, bidTime: new Date(Date.now() - 12000) },
        { id: 2, bidderAddress: "0xBidder14", bidAmount: 1.9, bidTime: new Date(Date.now() - 5000) },
      ],
    },
    {
      id: 7,
      sellerAddress: "0xSellerAddress7",
      minBid: 0.8,
      highestBid: 1.3,
      highestBidder: "0xHighestBidder7",
      endTime: new Date(Date.now() + 7 * 3600 * 1000), // 7 hours from now
      bids: [
        { id: 1, bidderAddress: "0xBidder15", bidAmount: 1.0, bidTime: new Date(Date.now() - 8000) },
        { id: 2, bidderAddress: "0xBidder16", bidAmount: 1.3, bidTime: new Date(Date.now() - 4000) },
      ],
    },
    {
      id: 8,
      sellerAddress: "0xSellerAddress8",
      minBid: 4.0,
      highestBid: 4.5,
      highestBidder: "0xHighestBidder8",
      endTime: new Date(Date.now() + 8 * 3600 * 1000), // 8 hours from now
      bids: [
        { id: 1, bidderAddress: "0xBidder17", bidAmount: 4.2, bidTime: new Date(Date.now() - 15000) },
        { id: 2, bidderAddress: "0xBidder18", bidAmount: 4.5, bidTime: new Date(Date.now() - 5000) },
      ],
    },
    {
      id: 9,
      sellerAddress: "0xSellerAddress9",
      minBid: 2.2,
      highestBid: 3.1,
      highestBidder: "0xHighestBidder9",
      endTime: new Date(Date.now() + 9 * 3600 * 1000), // 9 hours from now
      bids: [
        { id: 1, bidderAddress: "0xBidder19", bidAmount: 2.5, bidTime: new Date(Date.now() - 12000) },
        { id: 2, bidderAddress: "0xBidder20", bidAmount: 3.1, bidTime: new Date(Date.now() - 4000) },
      ],
    },
    {
      id: 10,
      sellerAddress: "0xSellerAddress10",
      minBid: 5.0,
      highestBid: 5.7,
      highestBidder: "0xHighestBidder10",
      endTime: new Date(Date.now() + 10 * 3600 * 1000), // 10 hours from now
      bids: [
        { id: 1, bidderAddress: "0xBidder21", bidAmount: 5.4, bidTime: new Date(Date.now() - 20000) },
        { id: 2, bidderAddress: "0xBidder22", bidAmount: 5.7, bidTime: new Date(Date.now() - 8000) },
      ],
    },
  ];
  
  const itemsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);

  // 模态窗口状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);

  // 计算当前页显示的内容
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAuctions = mockAuctions.slice(indexOfFirstItem, indexOfLastItem);

  // 处理分页
  const totalPages = Math.ceil(mockAuctions.length / itemsPerPage);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewDetail = (auction: Auction) => {
    setSelectedAuction(auction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAuction(null);
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto p-6 flex-grow">
        <h2 className="text-3xl font-bold mb-6">Current Auctions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentAuctions.map((auction) => (
            <AuctionCard
              key={auction.id}
              id={auction.id}
              sellerAddress={auction.sellerAddress}
              minBid={auction.minBid}
              highestBid={auction.highestBid}
              endTime={auction.endTime}
              onViewDetail={() => handleViewDetail(auction)}
            />
          ))}
        </div>

        {/* 分页组件 */}
        <div className="flex justify-between items-center px-4 py-3 mt-6">
          <div className="text-sm text-slate-500">
            Showing <b>{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, mockAuctions.length)}</b> of {mockAuctions.length}
          </div>
          <div className="flex space-x-1">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="px-3 py-1 min-w-9 min-h-9 text-sm font-normal text-slate-500 bg-white border border-slate-200 rounded hover:bg-slate-50 hover:border-slate-400 transition duration-200 ease disabled:opacity-50"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageClick(index + 1)}
                className={`px-3 py-1 min-w-9 min-h-9 text-sm font-normal ${
                  currentPage === index + 1
                    ? "text-white bg-slate-800 border-slate-800"
                    : "text-slate-500 bg-white border border-slate-200"
                } rounded hover:bg-slate-50 hover:border-slate-400 transition duration-200 ease`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-1 min-w-9 min-h-9 text-sm font-normal text-slate-500 bg-white border border-slate-200 rounded hover:bg-slate-50 hover:border-slate-400 transition duration-200 ease disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      <Footer />

      {/* 模态窗口 */}
      {selectedAuction && (
        <AuctionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          sellerAddress={selectedAuction.sellerAddress}
          minBid={selectedAuction.minBid}
          highestBid={selectedAuction.highestBid}
          highestBidder={selectedAuction.highestBidder}
          endTime={selectedAuction.endTime}
          bids={selectedAuction.bids}
        />
      )}
    </div>
  );
}
