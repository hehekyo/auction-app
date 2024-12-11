import { useState } from 'react';
import { message, Steps } from 'antd';
import { AuctionService } from '../services/auctionService';

type CreateBidModalProps = {
  isOpen: boolean;
  onClose: () => void;
  auctionId: string;
  minBid: number;
  highestBid: number;
  depositAmount: string;
  isSubmitting: boolean;
  onSuccess?: () => void;
};

export default function CreateBidModal({ 
  isOpen, 
  onClose, 
  auctionId, 
  minBid, 
  highestBid,
  depositAmount,
  isSubmitting,
  onSuccess 
}: CreateBidModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [bidAmount, setBidAmount] = useState<number>(minBid);
  const [error, setError] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayDeposit = async () => {
    try {
      setError(null);
      setIsProcessing(true);
      
      const auctionService = AuctionService.getInstance();
      await auctionService.deposit(auctionId, depositAmount);
      
      messageApi.success('Deposit paid successfully!');
      setCurrentStep(1);
    } catch (error: any) {
      console.error('Failed to pay deposit:', error);
      messageApi.error(error.message || 'Failed to pay deposit');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlaceBid = async () => {
    try {
      setError(null);
      setIsProcessing(true);
      
      if (bidAmount < minBid) {
        setError(`Bid cannot be lower than minimum bid ${minBid} DAT`);
        return;
      }

      if (bidAmount <= highestBid) {
        setError(`Bid must be higher than current highest bid ${highestBid} DAT`);
        return;
      }

      const auctionService = AuctionService.getInstance();
      
      const allowance = await auctionService.checkAllowance(auctionId, bidAmount);
      if (allowance < bidAmount) {
        await auctionService.approve(auctionId, bidAmount);
      }

      await auctionService.bid(auctionId, bidAmount);

      messageApi.success('Bid placed successfully!');
      onClose();
      onSuccess?.();
    } catch (error: any) {
      console.error('Failed to place bid:', error);
      messageApi.error(error.message || 'Failed to place bid');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      {contextHolder}
      <div className="bg-gray-800 text-gray-200 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Place a Bid</h2>
        
        <Steps
          current={currentStep}
          items={[
            { title: 'Pay Deposit' },
            { title: 'Place Bid' }
          ]}
          className="mb-6"
        />

        {currentStep === 0 ? (
          <div className="space-y-4">
            <p className="text-gray-400">
              A deposit of {depositAmount} DAT is required to participate in this auction.
            </p>
            <button
              onClick={handlePayDeposit}
              className="w-full py-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:bg-gray-500"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Pay Deposit'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {error && <p className="text-red-500">{error}</p>}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bid Amount (DAT)
              </label>
              <input
                type="number"
                className="w-full p-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={bidAmount}
                onChange={(e) => {
                  setBidAmount(Number(e.target.value));
                  setError(null);
                }}
                min={minBid}
                step="0.000000000000000001"
                disabled={isProcessing}
              />
            </div>

            <div className="text-sm text-gray-400">
              <p>Minimum Bid: {minBid} DAT</p>
              <p>Current Highest Bid: {highestBid} DAT</p>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500 transition"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handlePlaceBid}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition disabled:bg-gray-500"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Confirm Bid'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
