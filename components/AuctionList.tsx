import { useState, useEffect } from 'react';
import AuctionCard from './AuctionCard';
import AuctionModal from './AuctionModal';

type Bid = {
  id: number;
  bidderAddress: string;
  bidAmount: number;
  bidTime: Date;
};

type Auction = {
  id: number;
  sellerAddress: string;
  minBid: number;
  highestBid?: number;
  highestBidder?: string;
  endTime: Date;
  bids: Bid[];
};

type AuctionListProps = {
  refresh: boolean;
};

export default function AuctionList({ refresh }: AuctionListProps) {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAuctionId, setSelectedAuctionId] = useState<number | null>(null);

  const fetchAuctions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auctions');
      if (!response.ok) {
        throw new Error("Failed to fetch auctions");
      }
      const data = await response.json();
      setAuctions(data);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions(); 
  }, []);

  useEffect(() => {
    if (refresh) {
      fetchAuctions();
    }
  }, [refresh]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAuctions = auctions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(auctions.length / itemsPerPage);

  const handleNextPage = () => setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  const handlePreviousPage = () => setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  const handlePageClick = (page: number) => setCurrentPage(page);

  const handleViewDetail = (id: number) => {
    setSelectedAuctionId(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAuctionId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <button
          type="button"
          className="bg-gray-800 text-white font-bold rounded-lg h-max w-max hover:cursor-not-allowed duration-[500ms,800ms]"
          disabled
        >
          <div className="flex items-center justify-center p-3">
            <div className="h-5 w-5 border-t-transparent border-solid animate-spin rounded-full border-white border-4"></div>
            <span className="ml-2">Processing...</span>
          </div>
        </button>
      </div>
    );
  }

  if (error) return <div className="text-red-500 text-center">Error: {error}</div>;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {currentAuctions.map((auction) => (
          <AuctionCard
            key={auction.id}
            id={auction.id}
            sellerAddress={auction.sellerAddress}
            minBid={auction.minBid}
            highestBid={auction.highestBid}
            endTime={auction.endTime}
            onViewDetail={() => handleViewDetail(auction.id)}
          />
        ))}
      </div>

      {/* 分页组件 */}
      <div className="flex justify-between items-center px-4 py-3 mt-6">
        <div className="text-sm text-slate-500">
          Showing <b>{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, auctions.length)}</b> of {auctions.length}
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

      {/* 模态窗口 */}
      {selectedAuctionId && (
        <AuctionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          id={selectedAuctionId}
        />
      )}
    </div>
  );
}
