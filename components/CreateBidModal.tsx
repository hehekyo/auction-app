import { useState, useEffect } from 'react';
import { BidService } from '../services/bidService';

type CreateBidModalProps = {
  isOpen: boolean;
  onClose: () => void;
  auctionId: number;
  minBid: number;
  highestBid?: number;
};

export default function CreateBidModal({ isOpen, onClose, auctionId, minBid, highestBid }: CreateBidModalProps) {
  const [bidAmount, setBidAmount] = useState(0);
  const [bidderAddress, setBidderAddress] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const address = localStorage.getItem('wallet');
    if (address) {
      setBidderAddress(address);
    }
  }, []);

  const handleSubmit = async () => {
    if (!bidderAddress) {
      alert("Bidder address is missing.");
      return;
    }
    
    if (bidAmount < minBid) {
      setError(`Bid must be at least ${minBid} ETH.`);
      return;
    }

    if (highestBid !== undefined && bidAmount <= highestBid) {
      setError(`Bid must be higher than the current highest bid of ${highestBid} ETH.`);
      return;
    }

    try {
      // const bidService = BidService.getInstance();
      // const txHash = await bidService.placeBid(auctionId, bidAmount);
      // console.log('投标成功，交易哈希:', txHash);
      onClose(); // 关闭模态窗口
    } catch (error) {
      console.error('投标失败:', error);
      setError('投标失败，请检查您的钱包连接并确保有足够的 ETH');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-gray-800 text-gray-200 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Place a Bid</h2>
        
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <label className="block mb-4">
          <span className="text-gray-300">Bid Amount (ETH)</span>
          <input
            type="number"
            className="w-full p-2 mt-1 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={bidAmount}
            onChange={(e) => {
              setBidAmount(parseFloat(e.target.value));
              setError(null); // 清除错误
            }}
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
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition"
          >
            Place Bid
          </button>
        </div>
      </div>
    </div>
  );
}
