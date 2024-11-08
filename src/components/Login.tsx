"use client"

import { ethers } from 'ethers';
import { log } from 'console';
import { useRouter } from 'next/navigation';

import React, { useState } from 'react';
import { Button,message, Card, Layout, Typography,Image } from 'antd';
const { Content } = Layout;
const { Title } = Typography;

export default function Home() {
  const [loading, setLoading] = useState(false);
  const router = useRouter(); 

  const handleLogin = async () => {
    if (!window.ethereum) {
      return message.error('请安装MetaMask!');
    }

    setLoading(true);

    try {
      console.log("开始登录");
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      console.log("====provider",provider);
      // 请求用户连接钱包
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const wallet = await signer.getAddress();
      console.log("====wallet",wallet);
      const messageToSign = `Sign this message to authenticate with your wallet: ${wallet}`;
      const signature = await signer.signMessage(messageToSign);

      // 调用后端API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet, signature }),
      });

      const data = await response.json();

      if (response.ok) {
       // 将 JWT 令牌存储到 localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('wallet', data.wallet);

        message.success('登录成功！');
        console.log('JWT Token:', data.token);
        router.push('/');
    
      } else {
        message.error(data.error || '登录失败');
      }
    } catch (error) {
      message.error('登录出错，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='mx-auto mt-500 p-20'>
    <h1 className='text-4xl font-bold text-center mb-10'>Web3 Auction System</h1>
    <div className='flex flex-col p-20 items-center justify-center w-500 h-600 border-2 border-gray-200 rounded-2xl '>
         <Image src="login.jpg" alt="logo" width={200} height={200} preview={false} />
         <Button type="primary" onClick={handleLogin} loading={loading} className='mt-10'>
            Login with Wallet
        </Button>
  
    </div>
    </div>



  );
}
