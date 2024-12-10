import { useState } from 'react';
import { message } from 'antd';

type CreateBidModalProps = {
  isOpen: boolean;
  onClose: () => void;
  auctionId: string;
  minBid: number;
  highestBid: number;
  isSubmitting: boolean;
  onSuccess?: () => void;
};

export default function CreateBidModal({ 
  isOpen, 
  onClose, 
  auctionId, 
  minBid, 
  highestBid,
  isSubmitting,
  onSuccess 
}: CreateBidModalProps) {
  const [bidAmount, setBidAmount] = useState<number>(minBid);
  const [error, setError] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  const handleSubmit = async () => {
    setError(null);
    
    // 验证出价金额
    if (bidAmount < minBid) {
      setError(`出价不能低于最低出价 ${minBid} DAT`);
      return;
    }

    if (bidAmount <= highestBid) {
      setError(`出价必须高于当前最高出价 ${highestBid} DAT`);
      return;
    }

    try {
      const response = await fetch('/api/bids/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auctionId,
          bidAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '出价失败');
      }

      messageApi.success({
        content: '出价成功！',
        duration: 3,
      });

      onClose();
      onSuccess?.(); // 调用成功回调，用于刷新数据

    } catch (error: any) {
      console.error('出价失败:', error);
      messageApi.error({
        content: error.message || '出价失败，请重试',
        duration: 3,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      {contextHolder}
      <div className="bg-gray-800 text-gray-200 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Place a Bid</h2>
        
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            出价金额 (DAT)
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
            disabled={isSubmitting}
          />
        </div>

        <div className="text-sm text-gray-400 mb-4">
          <p>最低出价: {minBid} DAT</p>
          <p>当前最高出价: {highestBid} DAT</p>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500 transition"
            disabled={isSubmitting}
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition disabled:bg-gray-500"
            disabled={isSubmitting}
          >
            {isSubmitting ? '处理中...' : '确认出价'}
          </button>
        </div>
      </div>
    </div>
  );
}
