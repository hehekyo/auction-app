import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ConnectKitButton } from 'connectkit';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="lg:px-16 px-4 flex flex-wrap items-center py-4 shadow-lg bg-gray-900 text-gray-100 dark:bg-gray-800">
      <div className="flex-1 flex justify-between items-center">
        <Image
          src="/logo.png" // Replace with the correct logo path if necessary
          alt="DAuction Logo"
          width={40} // Adjust logo width as needed
          height={40}
          className="sm:w-[5.5rem] xs:w-[4rem]"
        />
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

      {/* Connect Wallet Button (for larger screens) */}
      <div className=" md:block ml-4">
        <ConnectKitButton />
      </div>
    </header>
  );
}
