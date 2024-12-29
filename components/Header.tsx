"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import Image from "next/image";
import { ConnectKitButton } from "connectkit";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaWallet } from "react-icons/fa";
import TokenDrawer from "./TokenDrawer";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const pathname = usePathname();

  return (
    <header className="lg:px-16 px-4 flex flex-wrap items-center py-2 shadow-lg bg-gray-900 text-gray-100 dark:bg-gray-800 relative">
      <div className="flex-1 flex items-center gap-8">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="DAuction Logo"
            width={80}
            height={80}
            className="w-[80px] h-[80px] object-contain rounded-full bg-white"
            priority
            unoptimized
          />
        </Link>

        {/* Desktop Navigation Menu */}
        <nav className="hidden md:flex items-center gap-6 font-bold ">
          <Link
            href="/"
            className={`hover:text-blue-400 transition ${
              pathname === "/" ? "text-blue-400" : ""
            }`}
          >
            Home
          </Link>
          <Link
            href="/trade"
            className={`hover:text-blue-400 transition ${
              pathname === "/trade" ? "text-blue-400" : ""
            }`}
          >
            Trade
          </Link>
          <Link
            href="/auctions"
            className={`hover:text-blue-400 transition ${
              pathname === "/auctions" ? "text-blue-400" : ""
            }`}
          >
            Auctions
          </Link>
          <Link
            href="/nfts"
            className={`hover:text-blue-400 transition ${
              pathname === "/nfts" ? "text-blue-400" : ""
            }`}
          >
            NFTs
          </Link>
        </nav>
      </div>

      {/* Wallet and Connect Button */}
      <div className="flex items-center gap-4">
        <div className="md:block">
          <ConnectKitButton.Custom>
            {({ isConnected, show, truncatedAddress, ensName }) => {
              const handleClick = () => {
                if (isConnected) {
                  setIsDrawerOpen(true);
                } else if (show) {
                  show();
                }
              };

              return (
                <button
                  onClick={handleClick}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <FaWallet className="text-lg" />
                  <span className="hidden md:inline">
                    {isConnected
                      ? ensName || truncatedAddress
                      : "Connect Wallet"}
                  </span>
                </button>
              );
            }}
          </ConnectKitButton.Custom>
        </div>
      </div>

      {/* Mobile menu toggle */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden block text-gray-200"
      >
        <svg
          className="fill-current"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
        >
          <title>menu</title>
          <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
        </svg>
      </button>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden w-full mt-4">
          <nav className="flex flex-col gap-4">
            <Link
              href="/"
              className={`hover:text-blue-400 transition ${
                pathname === "/" ? "text-blue-400" : ""
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/swap"
              className={`hover:text-blue-400 transition ${
                pathname === "/swap" ? "text-blue-400" : ""
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Swap
            </Link>
            <Link
              href="/auctions"
              className={`hover:text-blue-400 transition ${
                pathname === "/auctions" ? "text-blue-400" : ""
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Auctions
            </Link>
            <Link
              href="/nfts"
              className={`hover:text-blue-400 transition ${
                pathname === "/nfts" ? "text-blue-400" : ""
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              NFTs
            </Link>
          </nav>
        </div>
      )}

      {/* Token Balance Drawer */}
      <TokenDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </header>
  );
}
