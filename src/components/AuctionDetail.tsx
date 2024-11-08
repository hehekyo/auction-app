"use client"
import React, { useEffect, useState } from 'react';
import { Descriptions, Table, Typography, Spin,Button } from 'antd';
import axios from 'axios';
import { ColumnsType } from 'antd/es/table';
import { CreateBidModal } from '@/components/CreateBidModal';
import CountdownTimer from './CountdownTimer';
import Link from 'next/link';
import moment from 'moment';

const { Title } = Typography;

interface Auction {
  id: number;
  sellerAddress: string;
  minBid: number;
  highestBid: number | null;
  highestBidder: string | null;
  endTime: string;
  ended: boolean;
  createdAt: string;
  updatedAt: string;
  bids: Bid[];
}

interface Bid {
  id: number;
  bidderAddress: string;
  bidAmount: number;
  bidTime: string;
}

// 定义表格的列
const columns: ColumnsType<Bid> = [
  {
    title: 'Bidder',
    dataIndex: 'bidderAddress',
    key: 'bidderAddress',
  },
  {
    title: 'Amount',
    dataIndex: 'bidAmount',
    key: 'bidAmount',
    render: (text) => `$${text}`,
    sorter: (a, b) => a.bidAmount - b.bidAmount,
  },
  {
    title: 'Bid Time',
    dataIndex: 'bidTime',
    key: 'bidTime',
    render: (text) => moment(text).format('YYYY/MM/DD HH:mm:ss'),
    sorter: (a, b) => new Date(a.bidTime).getTime() - new Date(b.bidTime).getTime(),
  },
];

const AuctionDetails = ({ auctionId }: { auctionId: number }) => {
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchBids = async () => {
    try {
      const { data: auctionData } = await axios.get<Auction>(`/api/auctions/${auctionId}`);
      setAuction(auctionData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
    setLoading(false);
  };

  const handleBidSuccess = () => {
    fetchBids();
  }

  useEffect(() => {
    fetchBids();
  }, [auctionId]);

  if (loading) {
    return (    <div className='flex justify-center items-center h-screen'>
      <Spin size="large" />
    </div>)

  }

  return (
    <div>
      <div>
      <Link href="/auctions" className='text-blue-500 hover:text-blue-700'>
              Back to List
        </Link>
      </div>
      <div>
      {auction ? (
        <div className='container mx-auto p-2'>
          <Title level={2}>{`Auction ${auction.id}`}</Title>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Seller Address">{auction.sellerAddress}</Descriptions.Item>
            <Descriptions.Item label="Minimum Bid">{`$${auction.minBid}`}</Descriptions.Item>
            <Descriptions.Item label="Highest Bid">{auction.highestBid ? `$${auction.highestBid}` : 'No bids yet'}</Descriptions.Item>
            <Descriptions.Item label="Highest Bidder">{auction.highestBidder || 'No bidder yet'}</Descriptions.Item>
            <Descriptions.Item label="End Time">{new Date(auction.endTime).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="Status">{auction.ended ? 'Ended' : 'Active'}</Descriptions.Item>
          </Descriptions>
          <div>
          <CountdownTimer endTime={auction.endTime} />
          </div>
          <div className='mt-10'>
          <Title level={3}>Bids</Title>
          <div className='mb-4'>
          <Button type='primary' onClick={() => setIsModalVisible(true)} >Bid</Button>
          <CreateBidModal
            auctionId={auction.id}
            isVisible={isModalVisible}
            onSuccess={handleBidSuccess}
            onClose={() => setIsModalVisible(false)}
      />
          </div>
          
          <Table dataSource={auction.bids} columns={columns} rowKey="id" />
          </div>

        </div>
      ) : (
        <p>No auction details available.</p>
      )}
      </div>

    </div>
  );
};

export default AuctionDetails;
