import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { FaEthereum } from 'react-icons/fa';
import DatTokenIcon from '@/public/token.png';
import Image from 'next/image';

export default function TokenSwap() {
  const [fromToken, setFromToken] = useState<'ETH' | 'DAT'>('ETH');
  const [toToken, setToToken] = useState<'ETH' | 'DAT'>('DAT');
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [exchangeRate, setExchangeRate] = useState<number>(2000); // 1 ETH = 1000 DAT
  const [slippage, setSlippage] = useState<number>(0.5); // 0.5% 滑点
  const { address, isConnected } = useAccount();

  // 切换代币位置
  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount('');
    setToAmount('');
  };

  // 计算兑换金额
  useEffect(() => {
    if (fromAmount && !isNaN(Number(fromAmount))) {
      const amount = Number(fromAmount);
      const converted = fromToken === 'ETH' 
        ? amount * exchangeRate 
        : amount / exchangeRate;
      setToAmount(converted.toFixed(6));
    } else {
      setToAmount('');
    }
  }, [fromAmount, fromToken, exchangeRate]);

  // 处理兑换
  const handleSwap = async () => {
    if (!isConnected) {
      alert('请先连接钱包');
      return;
    }
    
    try {
      // TODO: 实现实际的兑换逻辑
      console.log('Swapping tokens...');
    } catch (error) {
      console.error('交换失败:', error);
      alert('交换失败，请重试');
    }
  };

  // 获取代币图标
  const getTokenIcon = (token: 'ETH' | 'DAT') => {
    if (token === 'ETH') {
      return <FaEthereum className="w-5 h-5 text-blue-400" />;
    }
    if (token === 'DAT') {
      return (
        <div className="w-8 h-8 relative">
          <Image
            src={DatTokenIcon}
            alt="DAT Token"
            width={40}
            height={40}
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-gray-800 rounded-2xl p-6 shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-100 mb-6">Token Swap</h2>
        
        {/* From Token */}
        <div className="bg-gray-700 rounded-xl p-6 mb-3">
          <div className="flex justify-between mb-3">
            <span className="text-gray-400 text-lg">From</span>
            <div className="flex items-center gap-3">
              {getTokenIcon(fromToken)}
              <select 
                value={fromToken}
                onChange={(e) => setFromToken(e.target.value as 'ETH' | 'DAT')}
                className="bg-gray-600 text-gray-200 rounded px-3 py-2 text-lg"
              >
                <option value="ETH">ETH</option>
                <option value="DAT">DAT</option>
              </select>
            </div>
          </div>
          <input
            type="number"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
            placeholder="0.0"
            className="w-full bg-transparent text-3xl text-gray-100 outline-none"
          />
        </div>

        {/* Swap Button */}
        <button 
          onClick={handleSwapTokens}
          className="w-full flex justify-center my-3"
        >
          <div className="bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition-colors text-xl">
            ⇅
          </div>
        </button>

        {/* To Token */}
        <div className="bg-gray-700 rounded-xl p-6 mb-6">
          <div className="flex justify-between mb-3">
            <span className="text-gray-400 text-lg">To</span>
            <div className="flex items-center gap-3">
              {getTokenIcon(toToken)}
              <select 
                value={toToken}
                onChange={(e) => setToToken(e.target.value as 'ETH' | 'DAT')}
                className="bg-gray-600 text-gray-200 rounded px-3 py-2 text-lg"
              >
                <option value="ETH">ETH</option>
                <option value="DAT">DAT</option>
              </select>
            </div>
          </div>
          <input
            type="number"
            value={toAmount}
            readOnly
            placeholder="0.0"
            className="w-full bg-transparent text-3xl text-gray-100 outline-none"
          />
        </div>

        {/* Exchange Rate Info */}
        <div className="bg-gray-700 rounded-xl p-6 mb-6">
          <div className="flex justify-between text-base">
            <span className="text-gray-400">Exchange Rate</span>
            <span className="text-gray-200">
              1 {fromToken} = {exchangeRate} {toToken}
            </span>
          </div>
          <div className="flex justify-between text-base mt-3">
            <span className="text-gray-400">Slippage Tolerance</span>
            <span className="text-gray-200">{slippage}%</span>
          </div>
        </div>

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          disabled={!isConnected || !fromAmount || Number(fromAmount) <= 0}
          className={`w-full py-5 rounded-xl text-xl font-bold ${
            isConnected && fromAmount && Number(fromAmount) > 0
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          } transition-colors`}
        >
          {!isConnected 
            ? 'Connect Wallet' 
            : !fromAmount || Number(fromAmount) <= 0
            ? 'Enter Amount'
            : 'Confirm Swap'}
        </button>
      </div>
    </div>
  );
} 