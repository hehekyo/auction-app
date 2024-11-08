import React from 'react'
import { message, Avatar, Button } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // 使用 next/navigation


export default function Header() {
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

  return (
    <div className='flex items-center justify-between p-6 border-b-2 height-35' >
      <div className='font-bold text-3xl text-center'>Web3 Auction System</div>
    <div>
      {/* 显示登录状态和用户头像 */}
      <Avatar
        icon={<UserOutlined />}
        style={{ marginRight: '10px' }}
      />
      <span>{userAddress}</span>
    </div>

    <Button type="primary" danger onClick={handleLogout}>
      Sign Out
    </Button>
  </div>
  )
}
