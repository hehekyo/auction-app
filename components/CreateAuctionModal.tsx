import { useState, useEffect } from 'react';

type CreateAuctionModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CreateAuctionModal({ isOpen, onClose }: CreateAuctionModalProps) {
  const [sellerAddress, setSellerAddress] = useState('');
  const [minBid, setMinBid] = useState(0);
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    const wallet = localStorage.getItem('wallet');
    if (wallet) {
      setSellerAddress(wallet);
    }
  }, []);

  const handleCreateAuction = () => {
    if (!sellerAddress || minBid <= 0 || !endTime) {
      alert("Please fill all fields correctly.");
      return;
    }

    const auctionData = {
      sellerAddress,
      minBid: parseFloat(minBid.toString()),
      endTime: new Date(endTime),
    };

    // 调用 API 创建拍卖
    fetch('/api/auctions/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(auctionData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to create auction');
        }
        return response.json();
      })
      .then((data) => {
        console.log('Auction created:', data);
        onClose(); // 关闭模态窗口
      })
      .catch((error) => {
        console.error('An error occurred:', error);
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-gray-800 text-gray-200 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Create New Auction</h2>
        
        <label className="block mb-4">
          <span className="text-gray-300">Seller Address</span>
          <input
            type="text"
            className="w-full p-2 mt-1 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:outline-none"
            value={sellerAddress}
            readOnly
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-300">Minimum Bid (ETH)</span>
          <input
            type="number"
            className="w-full p-2 mt-1 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:outline-none"
            value={minBid}
            onChange={(e) => setMinBid(parseFloat(e.target.value))}
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-300">End Time</span>
          <input
            type="datetime-local"
            className="w-full p-2 mt-1 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:outline-none"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </label>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateAuction}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition"
          >
            Create Auction
          </button>
        </div>
      </div>
    </div>
  );
}
