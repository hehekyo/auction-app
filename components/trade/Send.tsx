import { useState, useEffect } from "react";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { FaEthereum } from "react-icons/fa";
import { MdToken, MdKeyboardArrowDown } from "react-icons/md";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { Address, formatEther } from "viem";
import TokenSelectModal from "../TokenSelectModal";
import { SendService } from "@/services/sendService";

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

export default function Send() {
  const [fromToken, setFromToken] = useState<Token>(TOKENS[0]);
  const [fromAmount, setFromAmount] = useState<string>("");
  const [toAddress, setToAddress] = useState<string>(
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
  );
  const [isSelectingFromToken, setIsSelectingFromToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState<string>("0");

  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  useEffect(() => {
    const fetchBalance = async () => {
      if (!publicClient || !walletClient || !address) return;

      const sendService = new SendService(publicClient, walletClient);
      try {
        let rawBalance;
        if (fromToken.symbol === "ETH") {
          rawBalance = await sendService.getETHBalance(address);
        } else if (fromToken.address) {
          rawBalance = await sendService.getTokenBalance(
            fromToken.address as Address,
            address
          );
        }
        setBalance(formatEther(rawBalance || BigInt(0)));
      } catch (error) {
        console.error("Failed to fetch balance:", error);
        setBalance("0");
      }
    };

    fetchBalance();
  }, [publicClient, walletClient, address, fromToken]);

  const handleSend = async () => {
    if (
      !publicClient ||
      !walletClient ||
      !isConnected ||
      !address ||
      !fromAmount ||
      !toAddress
    )
      return;

    setIsLoading(true);
    const sendService = new SendService(publicClient, walletClient);

    try {
      let hash;
      if (fromToken.symbol === "ETH") {
        hash = await sendService.sendETH(toAddress as Address, fromAmount);
      } else if (fromToken.address) {
        hash = await sendService.sendToken(
          fromToken.address as Address,
          toAddress as Address,
          fromAmount
        );
      }

      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-medium">Transaction Successful!</span>
          <span className="text-sm text-gray-500">
            {fromAmount} {fromToken.symbol} → {toAddress}
          </span>
          <a
            href={`https://sepolia.etherscan.io/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            View on Etherscan
          </a>
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
    } catch (error) {
      console.error("Send failed:", error);
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
      {/* You're sending */}
      <div>
        <div className="text-gray-600 text-lg mb-2">You're sending</div>
        <div className="bg-gray-50 rounded-2xl p-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-500">Amount</span>
            <span className="text-gray-500">Balance: {balance}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0"
                className="text-4xl bg-transparent outline-none w-[200px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
          <div className="text-sm text-gray-500 mt-1">0 {fromToken.symbol}</div>
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

      {/* Send Button */}
      <button
        onClick={handleSend}
        disabled={!isConnected || !fromAmount || !toAddress || isLoading}
        className={`w-full mt-4 py-4 rounded-2xl text-lg font-semibold transition-colors
          ${
            isConnected && fromAmount && toAddress && !isLoading
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
      >
        {!isConnected
          ? "Connect Wallet"
          : !fromAmount || !toAddress
          ? "Enter Amount and Address"
          : isLoading
          ? "Processing..."
          : "Send"}
      </button>

      {/* Token Select Modal */}
      <TokenSelectModal
        isOpen={isSelectingFromToken}
        onClose={() => setIsSelectingFromToken(false)}
        onSelect={(token) => {
          setFromToken(token);
          setFromAmount("");
          setIsSelectingFromToken(false);
        }}
        selectedToken={fromToken}
      />
    </div>
  );
}
