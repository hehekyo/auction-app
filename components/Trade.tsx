"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { FaEthereum, FaExchangeAlt } from "react-icons/fa";
import { MdToken, MdKeyboardArrowDown, MdSettings } from "react-icons/md";
import Image from "next/image";
import TokenSelectModal from "./TokenSelectModal";

// Token 类型定义
interface Token {
  symbol: string;
  name: string;
  icon?: React.ReactNode;
  logoURI?: string;
  address?: string;
}

const TOKENS: Token[] = [
  {
    symbol: "ETH",
    name: "Ethereum",
    icon: <FaEthereum className="w-6 h-6 text-[#627EEA]" />,
    logoURI: "https://token-icons.s3.amazonaws.com/eth.png",
  },
  {
    symbol: "DAT",
    name: "DAuction Token",
    icon: <MdToken className="w-6 h-6 text-blue-500" />,
    logoURI: "/logo1.png",
  },
  // 可以添加更多代币
];

export default function Trade() {
  const [activeTab, setActiveTab] = useState<"swap" | "send" | "buy">("swap");
  const [fromToken, setFromToken] = useState<Token>(TOKENS[0]);
  const [toToken, setToToken] = useState<Token>(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState<string>("");
  const [toAmount, setToAmount] = useState<string>("");
  const { address, isConnected } = useAccount();
  const [isSelectingFromToken, setIsSelectingFromToken] = useState(false);
  const [isSelectingToToken, setIsSelectingToToken] = useState(false);

  // 处理代币交换
  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount("");
    setToAmount("");
  };

  // 计算兑换金额
  useEffect(() => {
    if (fromAmount && !isNaN(Number(fromAmount))) {
      const rate = 2000; // 示例汇率
      const amount = Number(fromAmount);
      const converted =
        fromToken.symbol === "ETH" ? amount * rate : amount / rate;
      setToAmount(converted.toFixed(6));
    } else {
      setToAmount("");
    }
  }, [fromAmount, fromToken]);

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-3xl p-4 shadow-lg mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab("swap")}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === "swap"
                ? "bg-gray-100 text-gray-900"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Swap
          </button>

          <button
            onClick={() => setActiveTab("send")}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === "send"
                ? "bg-gray-100 text-gray-900"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Send
          </button>
          <button
            onClick={() => setActiveTab("buy")}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === "buy"
                ? "bg-gray-100 text-gray-900"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Buy
          </button>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <MdSettings className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Swap Container */}
      <div className="space-y-2">
        {/* From Token */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-500">Sell</span>
            <span className="text-gray-500">Balance: 0.0</span>
          </div>
          <div className="flex items-center justify-between">
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0"
              className="text-4xl bg-transparent outline-none w-2/3"
            />
            <button
              onClick={() => setIsSelectingFromToken(true)}
              className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl hover:bg-gray-100"
            >
              {fromToken.logoURI ? (
                <Image
                  src={fromToken.logoURI}
                  alt={fromToken.symbol}
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              ) : (
                fromToken.icon
              )}
              <span className="font-medium">{fromToken.symbol}</span>
              <MdKeyboardArrowDown className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-2 z-10">
          <button
            onClick={handleSwapTokens}
            className="bg-white border border-gray-200 rounded-xl p-2 hover:bg-gray-50"
          >
            <FaExchangeAlt className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* To Token */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-500">Buy</span>
            <span className="text-gray-500">Balance: 0.0</span>
          </div>
          <div className="flex items-center justify-between">
            <input
              type="number"
              value={toAmount}
              readOnly
              placeholder="0"
              className="text-4xl bg-transparent outline-none w-2/3"
            />
            <button
              onClick={() => setIsSelectingToToken(true)}
              className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl hover:bg-gray-100"
            >
              {toToken.logoURI ? (
                <Image
                  src={toToken.logoURI}
                  alt={toToken.symbol}
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              ) : (
                toToken.icon
              )}
              <span className="font-medium">{toToken.symbol}</span>
              <MdKeyboardArrowDown className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Exchange Info */}
      <div className="mt-4 p-3 bg-gray-50 rounded-xl">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Exchange Rate</span>
          <span className="text-gray-900">
            1 {fromToken.symbol} = 2000 {toToken.symbol}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <button
        disabled={!isConnected || !fromAmount || Number(fromAmount) <= 0}
        className={`w-full mt-4 py-4 rounded-2xl text-lg font-semibold transition-colors
          ${
            isConnected && fromAmount && Number(fromAmount) > 0
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
      >
        {!isConnected
          ? "Connect Wallet"
          : !fromAmount || Number(fromAmount) <= 0
          ? "Enter Amount"
          : "Swap"}
      </button>

      {/* Token Select Modals */}
      <TokenSelectModal
        isOpen={isSelectingFromToken}
        onClose={() => setIsSelectingFromToken(false)}
        onSelect={(token) => {
          setFromToken(token);
          setFromAmount("");
          setToAmount("");
        }}
        selectedToken={fromToken}
      />

      <TokenSelectModal
        isOpen={isSelectingToToken}
        onClose={() => setIsSelectingToToken(false)}
        onSelect={(token) => {
          setToToken(token);
          setFromAmount("");
          setToAmount("");
        }}
        selectedToken={toToken}
      />
    </div>
  );
}
