import React, { useState } from 'react';

type Bid = {
  id: number;
  bidderAddress: string;
  bidAmount: number;
  bidTime: Date;
};

type AuctionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  sellerAddress: string;
  minBid: number;
  highestBid?: number;
  highestBidder?: string;
  endTime: Date;
  bids: Bid[];
};

export default function AuctionModal({
  isOpen,
  onClose,
  sellerAddress,
  minBid,
  highestBid,
  highestBidder,
  endTime,
  bids,
}: AuctionModalProps) {
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState("");

  if (!isOpen) return null;

  const handleOpenBidModal = () => {
    setIsBidModalOpen(true);
  };

  const handleCloseBidModal = () => {
    setIsBidModalOpen(false);
    setBidAmount("");
  };

  const handleBidSubmit = () => {
    console.log("Bid Amount:", bidAmount);
    handleCloseBidModal();
  };

  // Close modal when clicking outside of the modal content
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-gray-800 p-6 rounded-lg w-4/5 h-4/5 overflow-y-auto text-gray-200" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-400"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4">Auction Details</h2>
        <p><strong>Seller Address:</strong> {sellerAddress}</p>
        <p><strong>Minimum Bid:</strong> {minBid} ETH</p>
        <p><strong>Highest Bid:</strong> {highestBid ? `${highestBid} ETH` : "No bids yet"}</p>
        <p><strong>Highest Bidder:</strong> {highestBidder || "No bidder yet"}</p>
        <p><strong>End Time:</strong> {new Date(endTime).toLocaleString()}</p>

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Bid History</h3>
          <div className="shadow-lg rounded-lg overflow-hidden">
            <table className="w-full bg-gray-800 text-gray-300">
              <thead>
                <tr className="bg-gray-700 text-gray-400">
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase">Bidder</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase">Amount (ETH)</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase">Bid Time</th>
                </tr>
              </thead>
              <tbody>
                {bids.length > 0 ? (
                  bids.map((bid) => (
                    <tr key={bid.id} className="border-t border-gray-700">
                      <td className="px-6 py-4 text-sm font-medium">{bid.bidderAddress}</td>
                      <td className="px-6 py-4 text-sm">{bid.bidAmount}</td>
                      <td className="px-6 py-4 text-sm">{new Date(bid.bidTime).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-400">No bids yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <button
          onClick={handleOpenBidModal}
          className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-500"
        >
          Bid
        </button>
      </div>

      {isBidModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50" onClick={handleCloseBidModal}>
          <div className="bg-gray-800 p-6 rounded-lg w-1/3 text-gray-200" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">Place Your Bid</h3>
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder="Enter your bid amount"
              className="w-full p-2 mb-4 text-black rounded"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCloseBidModal}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleBidSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500"
              >
                Submit Bid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
