"use client"
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Image from 'next/image';
import { ConnectKitButton } from 'connectkit';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const pathname = usePathname();

  useEffect(() => {
    const login = async (wallet: string) => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet }),
        });

        if (response.ok) {
          const { token, wallet } = await response.json();
          localStorage.setItem('token', token);
          localStorage.setItem('wallet', wallet);
          console.log('Logged in successfully');
        } else {
          console.error('Login failed');
        }
      } catch (error) {
        console.error('An error occurred during login:', error);
      }
    };

    if (isConnected && address) {
      login(address);
    }
  }, [address, isConnected]);

  return (
    <header className="lg:px-16 px-4 flex flex-wrap items-center py-2 shadow-lg bg-gray-900 text-gray-100 dark:bg-gray-800">
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
              pathname === '/' ? 'text-blue-400' : ''
            }`}
          >
            Home
          </Link>
          <Link 
            href="/swap"
            className={`hover:text-blue-400 transition ${
              pathname === '/swap' ? 'text-blue-400' : ''
            }`}
          >
            Swap
          </Link>
          <Link 
            href="/auctions"
            className={`hover:text-blue-400 transition ${
              pathname === '/auctions' ? 'text-blue-400' : ''
            }`}
          >
            Auctions
          </Link>
        </nav>
      </div>

      {/* Mobile menu toggle */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden block text-gray-200"
      >
        <svg className="fill-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
          <title>menu</title>
          <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
        </svg>
      </button>

      {/* Connect Wallet Button */}
      <div className="md:block ml-4">
        <ConnectKitButton />
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden w-full mt-4">
          <nav className="flex flex-col gap-4">
            <Link 
              href="/swap"
              className={`hover:text-blue-400 transition ${
                pathname === '/swap' ? 'text-blue-400' : ''
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Swap
            </Link>
            <Link 
              href="/auctions"
              className={`hover:text-blue-400 transition ${
                pathname === '/auctions' ? 'text-blue-400' : ''
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Auctions
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
