"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // 使用 next/navigation
import { message, Avatar, Button } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import AuctionList from '@/components/AuctionList';
import Header from '@/components/Header';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // 检查本地存储中的登录状态
    const token = localStorage.getItem('token');
    const wallet = localStorage.getItem('wallet');

    if (!token) {
      // message.error('请先登录！');
      router.push('/login');
    } else {
      // 如果存在令牌和钱包地址，设置状态
      setIsAuthenticated(true);
      setUserAddress(wallet);
      router.push('/auctions');
    }
  }, [router]);

  // 处理登出功能
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('walletAddress');
    setIsAuthenticated(false);
    message.success('已登出成功');
    router.push('/login');
  };

  // 如果用户未通过身份验证，不渲染内容
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div  >
        <Header/> 
      <div className='mt-10 font-bold text-3xl text-center'>
      <h1>Web3 Auction System</h1>
      </div>
      
    </div>
  );
}
