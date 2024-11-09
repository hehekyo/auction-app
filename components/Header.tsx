import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Image from 'next/image';
import { ConnectKitButton } from 'connectkit';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { address, isConnected } = useAccount();

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
      <div className="flex-1 flex justify-between items-center">
      <Image
  src="/logo.png"
  alt="DAuction Logo"
  width={80} // 确保分辨率清晰
  height={80}
  className="w-[80px] h-[80px] object-contain rounded-full" // 添加 'rounded-full' 使图片呈现圆形
  priority // 预加载图片以获得更清晰的渲染
  unoptimized // 不进行额外的图像优化处理
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
      <div className="md:block ml-4">
        <ConnectKitButton />
      </div>
    </header>
  );
}
