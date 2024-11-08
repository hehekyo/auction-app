"use client"
import { Table,Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { CreateAuctionModal } from './CreateAuctionModal';
import moment from 'moment';

interface Auction {
    id: number;
    sellerAddress: string;
    minBid: number;
    highestBid: number | null;
    highestBidder: string | null;
    startTime: string;
    endTime: string;
    ended: boolean;
  }

  const columns: ColumnsType<Auction> = [
    {
      title: 'Auction ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Seller Address',
      dataIndex: 'sellerAddress',
      key: 'sellerAddress',
    },
    {
      title: 'Minimum Bid',
      dataIndex: 'minBid',
      key: 'minBid',
    },
    {
      title: 'Highest Bid',
      dataIndex: 'highestBid',
      key: 'highestBid',
      render: (text: number | null) => text ?? 'No bids yet',
    },
    {
      title: 'Highest Bidder',
      dataIndex: 'highestBidder',
      key: 'highestBidder',
      render: (text: string | null) => text ?? 'No bidder yet',
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (text: string) => moment(text).format('YYYY/MM/DD HH:mm:ss'),
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (text: string) => moment(text).format('YYYY/MM/DD HH:mm:ss'),
    },
    {
      title: 'Ended',
      dataIndex: 'ended',
      key: 'ended',
      render: (text: boolean) => (text ? 'Yes' : 'No'),
    },
    
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => <a href={`/auctions/${record.id}`} className='text-blue-500 hover:text-blue-700'>Detail</a>,
    },
  ];
export default  function Page() {

  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

   const fetchAuctions = async () => {
    const res = await fetch('/api/auctions');
    const result = await res.json();

    // let auctions = await db.auction.findMany();

    if (result) { // 确保存在拍卖数据
      console.log("======data:", result); // 打印拍卖数据
      setAuctions(result); // 设置拍卖数据到状态
    }
  }

  useEffect(() => {
    fetchAuctions();
  }, []);


  const handleAuctionSuccess = () => {
    fetchAuctions();  // 重新加载拍卖列表
  };

  return (
    <div className='container mx-auto p-2'>
      <h1 className='text-3xl font-bold mb-4'>Auction List</h1>

      <div className='mb-4'>
          <Button type='primary' onClick={() => setIsModalVisible(true)} >Create</Button>
          <CreateAuctionModal
            isVisible={isModalVisible}
            onSuccess={handleAuctionSuccess}
            onClose={() => setIsModalVisible(false)}
      />
          </div>



      {/* <div className='mb-4'>
      <CreateAuctionModal />
      </div> */}
    <Table columns={columns} dataSource={auctions} rowKey="id" />    
    </div>
    
  );
}
