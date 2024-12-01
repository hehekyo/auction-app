import { useState, useEffect } from 'react';
import Image from 'next/image';
import { formatDistance } from 'date-fns';

type AuctionStatus = 'upcoming' | 'active' | 'ended';

type AuctionCardProps = {
  auctionId: string;
  seller: string;
  nftContract: string;
  tokenId: string;
  tokenURI: string;
  auctionType: string;
  startingPrice: string;
  reservePrice: string;
  duration: string;
  depositAmount: string;
  startTime: string;
  endTime: string;
  onViewDetail: () => void;
};

const METADATA_CACHE = new Map<string, any>();

const getIPFSUrl = (url: string) => {
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  return url;
};

// 检查 URL 是否是图片
const isImageUrl = (url: string) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
};

// 获取元数据的函数
const getNFTMetadata = async (tokenURI: string) => {
  const cacheKey = tokenURI;
  
  if (METADATA_CACHE.has(cacheKey)) {
    return METADATA_CACHE.get(cacheKey);
  }

  try {
    // 如果 tokenURI 直接是图片 URL
    if (isImageUrl(tokenURI)) {
      const metadata = {
        name: 'NFT',
        image: getIPFSUrl(tokenURI)
      };
      METADATA_CACHE.set(cacheKey, metadata);
      return metadata;
    }

    // 否则尝试获取元数据
    const response = await fetch(getIPFSUrl(tokenURI));
    const metadata = await response.json();
    
    // 确保 image URL 也经过 IPFS 处理
    if (metadata.image) {
      metadata.image = getIPFSUrl(metadata.image);
    }
    
    METADATA_CACHE.set(cacheKey, metadata);
    return metadata;
  } catch (error) {
    console.error('Error fetching metadata:', error);
    // 如果解析失败，将 tokenURI 作为图片 URL
    const fallbackMetadata = {
      name: 'NFT',
      image: getIPFSUrl(tokenURI)
    };
    METADATA_CACHE.set(cacheKey, fallbackMetadata);
    return fallbackMetadata;
  }
};

export default function AuctionCard({
  auctionId,
  seller,
  nftContract,
  tokenId,
  tokenURI,
  auctionType,
  startingPrice,
  reservePrice,
  depositAmount,
  startTime,
  endTime,
  onViewDetail
}: AuctionCardProps) {
  const [nftMetadata, setNftMetadata] = useState<{ name: string; image: string } | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [status, setStatus] = useState<AuctionStatus>('active');

  // 获取 NFT 元数据
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const metadata = await getNFTMetadata(tokenURI);

        setNftMetadata(metadata);
      } catch (error) {
        console.error('Error loading NFT metadata:', error);
      }
    };
    
    loadMetadata();
  }, [tokenURI]);

    // 获取拍卖状态
    const getAuctionStatus = (startTime: string, endTime: string): AuctionStatus => {
      const now = Date.now();
      const start = Number(startTime) * 1000;
      const end = Number(endTime) * 1000;
  
      if (now < start) return 'upcoming';
      if (now > end) return 'ended';
      return 'active';
    };

      // 获取状态标签样式
  const getStatusStyle = (status: AuctionStatus) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-500 text-white';
      case 'active':
        return 'bg-green-500 text-white';
      case 'ended':
        return 'bg-gray-500 text-white';
    }
  };

  // 更新时间和状态
  useEffect(() => {
    const updateTimeAndStatus = () => {
      const now = Date.now();
      const start = Number(startTime) * 1000;
      const end = Number(endTime) * 1000;
      const currentStatus = getAuctionStatus(startTime, endTime);
      
      setStatus(currentStatus);

      if (currentStatus === 'upcoming') {
        setTimeLeft(`Starts ${formatDistance(start, now, { addSuffix: true })}`);
      } else if (currentStatus === 'ended') {
        setTimeLeft('Auction ended');
      } else {
        setTimeLeft(`Ends ${formatDistance(end, now, { addSuffix: true })}`);
      }
    };

    updateTimeAndStatus();
    const timer = setInterval(updateTimeAndStatus, 1000);

    return () => clearInterval(timer);
  }, [startTime, endTime]);

 

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden  hover:shadow-lg transition-transform  hover:scale-105 hover:bg-gray-750"
>
      {/* NFT Image */}
      <div className="relative aspect-square">
        {nftMetadata?.image ? (
          <Image
            src={nftMetadata.image}
            alt={nftMetadata.name || 'NFT'}
            layout="fill"
            objectFit="cover"
            className="transition-transform"
          />
        ) : (
          <div className="w-full h-full bg-gray-700 animate-pulse" />
        )}
        
        {/* Status Badge */}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(status)}`}>
          {status === 'upcoming' ? 'Upcoming' : status === 'active' ? 'Live' : 'Ended'}
        </div>
      </div>

      {/* Auction Info */}
      <div className="p-4 space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Type</span>
            <span className="text-gray-200">
              {auctionType === '0' ? 'English' : 'Dutch'} Auction
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Starting Price</span>
            <span className="text-gray-200">{startingPrice} DAT</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">NFT Contract</span>
            <span className="text-gray-200">
              {`${nftContract.slice(0, 6)}...${nftContract.slice(-4)}`}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Token ID</span>
            <span className="text-gray-200">#{tokenId}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Status</span>
            <span className={`font-medium ${
              status === 'active' ? 'text-green-400' : 
              status === 'upcoming' ? 'text-blue-400' : 
              'text-gray-400'
            }`}>
              {timeLeft}
            </span>
          </div>
        </div>

        {/* View Detail Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetail();
          }}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
            transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <span>View Details</span>
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
