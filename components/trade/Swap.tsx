import { useState, useEffect, useCallback } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { FaEthereum, FaExchangeAlt } from "react-icons/fa";
import { MdToken, MdKeyboardArrowDown } from "react-icons/md";
import Image from "next/image";
import { Address } from "viem";
import { toast } from "react-hot-toast";
import TokenSelectModal from "../TokenSelectModal";
import { SwapService } from "@/services/swapService";

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

export default function Swap() {
  const [fromToken, setFromToken] = useState<Token>(TOKENS[0]);
  const [toToken, setToToken] = useState<Token>(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState<string>("");
  const [toAmount, setToAmount] = useState<string>("");
  const [isSelectingFromToken, setIsSelectingFromToken] = useState(false);
  const [isSelectingToToken, setIsSelectingToToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const fromTokenAddress = process.env.NEXT_PUBLIC_WETH_ADDRESS;
  const toTokenAddress = process.env.NEXT_PUBLIC_DAT_CONTRACT_ADDRESS;

  const calculateOutputAmount = useCallback(async () => {
    if (!publicClient || !fromAmount || !walletClient) {
      setToAmount("");
      return;
    }

    try {
      const swapService = new SwapService(publicClient, walletClient);
      const amountIn = BigInt(parseFloat(fromAmount) * 1e18);

      const amounts = await swapService.getAmountsOut(amountIn, [
        fromTokenAddress as Address,
        toTokenAddress as Address,
      ]);

      const outputAmount = (Number(amounts[1]) / 1e18).toFixed(2);
      setToAmount(outputAmount);
    } catch (error) {
      console.error("Failed to calculate output amount:", error);
      setToAmount("");
    }
  }, [
    fromAmount,
    publicClient,
    walletClient,
    fromTokenAddress,
    toTokenAddress,
  ]);

  useEffect(() => {
    calculateOutputAmount();
  }, [calculateOutputAmount]);

  const handleSwap = async () => {
    if (
      !publicClient ||
      !walletClient ||
      !isConnected ||
      !address ||
      !fromAmount
    )
      return;

    setIsLoading(true);
    const swapService = new SwapService(publicClient, walletClient);

    try {
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 60 * 24);
      const amountIn = BigInt(parseFloat(fromAmount) * 1e18);
      const amountOutMin = BigInt(parseFloat(toAmount) * 0.99 * 1e18);

      if (fromToken.symbol === "ETH") {
        const hash = await swapService.swapExactETHForTokens({
          amountOutMin,
          path: [fromTokenAddress as Address, toTokenAddress as Address],
          to: address,
          deadline,
          value: amountIn,
        });

        toast.success(
          <div className="flex flex-col gap-1">
            <span className="font-medium">Transaction Successful!</span>
            <span className="text-sm text-gray-500">
              {fromAmount} {fromToken.symbol} → {toAmount} {toToken.symbol}
            </span>
          </div>,
          {
            duration: 5000,
            position: "top-center",
            className: "bg-white shadow-xl",
            style: {
              borderRadius: "16px",
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(10px)",
            },
            icon: "🎉",
          }
        );
      }
    } catch (error) {
      console.error("Swap failed:", error);
      toast.error("Transaction failed, please try again", {
        position: "top-center",
        style: {
          borderRadius: "16px",
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
        onClick={handleSwap}
        disabled={!isConnected || !fromAmount || isLoading}
        className={`w-full mt-4 py-4 rounded-2xl text-lg font-semibold transition-colors
          ${
            isConnected && fromAmount && !isLoading
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
      >
        {!isConnected
          ? "Connect Wallet"
          : !fromAmount
          ? "Enter Amount"
          : isLoading
          ? "Processing..."
          : "Swap"}
      </button>

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
