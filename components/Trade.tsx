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
];

export default function Trade() {
  const [activeTab, setActiveTab] = useState<"swap" | "send" | "buy">("swap");
  const [fromToken, setFromToken] = useState<Token>(TOKENS[0]);
  const [toToken, setToToken] = useState<Token>(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState<string>("");
  const [toAmount, setToAmount] = useState<string>("");
  const [toAddress, setToAddress] = useState<string>("");
  const { address, isConnected } = useAccount();
  const [isSelectingFromToken, setIsSelectingFromToken] = useState(false);
  const [isSelectingToToken, setIsSelectingToToken] = useState(false);

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
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <MdSettings className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {activeTab === "swap" ? (
        // Swap Container
        <div className="space-y-4">
          {/* From Token */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">From</span>
              <span className="text-gray-500">Balance: 0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0"
                className="text-4xl bg-transparent outline-none w-[200px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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

          {/* Swap Icon */}
          <div className="flex justify-center">
            <button className="p-2 rounded-xl hover:bg-gray-100">
              <FaExchangeAlt className="w-5 h-5 text-blue-500" />
            </button>
          </div>

          {/* To Token */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">To</span>
              <span className="text-gray-500">Balance: 0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <input
                type="number"
                value={toAmount}
                onChange={(e) => setToAmount(e.target.value)}
                placeholder="0"
                className="text-4xl bg-transparent outline-none w-[200px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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

          {/* Swap Button */}
          <button
            disabled={!isConnected || !fromAmount}
            className={`w-full mt-4 py-4 rounded-2xl text-lg font-semibold transition-colors
              ${
                isConnected && fromAmount
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
          >
            {!isConnected
              ? "Connect Wallet"
              : !fromAmount
              ? "Enter Amount"
              : "Swap"}
          </button>
        </div>
      ) : activeTab === "send" ? (
        // Send Container
        <div className="space-y-4">
          {/* You're sending */}
          <div>
            <div className="text-gray-600 text-lg mb-2">You're sending</div>
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Amount</span>
                <span className="text-gray-500">Balance: 0.0</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-4xl text-gray-900">$</span>
                  <input
                    type="number"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    placeholder="0"
                    className="text-4xl bg-transparent outline-none w-32 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
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
              <div className="text-sm text-gray-500 mt-1">
                0 {fromToken.symbol}
              </div>
            </div>
          </div>

          {/* To Address */}
          <div>
            <div className="text-gray-600 mb-2">To</div>
            <div className="bg-gray-50 rounded-2xl p-4">
              <input
                type="text"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                placeholder="Wallet address or ENS name"
                className="w-full bg-transparent outline-none text-gray-900"
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            disabled={!isConnected || !fromAmount || !toAddress}
            className={`w-full mt-4 py-4 rounded-2xl text-lg font-semibold transition-colors
              ${
                isConnected && fromAmount && toAddress
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
          >
            {!isConnected
              ? "Connect Wallet"
              : !fromAmount || !toAddress
              ? "Enter Amount and Address"
              : "Send"}
          </button>
        </div>
      ) : null}

      {/* Token Select Modal */}
      <TokenSelectModal
        isOpen={isSelectingFromToken || isSelectingToToken}
        onClose={() => {
          setIsSelectingFromToken(false);
          setIsSelectingToToken(false);
        }}
        onSelect={(token) => {
          if (isSelectingFromToken) {
            setFromToken(token);
            setFromAmount("");
          } else {
            setToToken(token);
            setToAmount("");
          }
          setIsSelectingFromToken(false);
          setIsSelectingToToken(false);
        }}
        selectedToken={isSelectingFromToken ? fromToken : toToken}
      />
    </div>
  );
}
