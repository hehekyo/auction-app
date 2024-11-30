import Image from 'next/image';
import { FaEthereum } from 'react-icons/fa';
import { SiBasicattentiontoken } from "react-icons/si";
import { MdToken } from "react-icons/md";


type AuctionCardProps = {
  id: number;
  name: string;
  image: string;
  seller: string;
  initialBid: number;
  highestBid?: number;
  endTime: Date;
  onViewDetail: () => void;
};

export default function AuctionCard({
  name,
  image = '/nfts/1.jpg',
  seller,
  initialBid,
  highestBid = 1000,
  endTime,
  onViewDetail,
}: AuctionCardProps) {
  // const isOngoing = new Date() < new Date(endTime);
  const isOngoing = true;
  console.log("====sellerAddress",seller);
  
  const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div 
      onClick={onViewDetail}
      className="bg-gray-800/70 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50
        cursor-pointer transition-transform duration-300 hover:scale-105"
    >
      {/* Image Container */}
      <div className="relative aspect-square">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-300"
        />
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold
            ${isOngoing 
              ? 'bg-green-500/80 text-white' 
              : 'bg-red-500/80 text-white'}`}
          >
            {isOngoing ? 'Live' : 'Ended'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-100 mb-2">{name}</h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Seller</span>
            <span className="text-gray-200">{formatAddress(seller)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Min Bid</span>
            <div className="flex items-center gap-1 text-gray-200">
              <MdToken className="text-blue-400" />
              <span>{initialBid} DAT</span>
            </div>
          </div>

          {highestBid && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Current Bid</span>
              <div className="flex items-center gap-1 text-gray-200">
                <MdToken className="text-blue-400" />
                <span>{highestBid} DAT</span>
              </div>
            </div>
          )}
        </div>

        {/* View Detail Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetail();
          }}
          className="w-full mt-4 rounded-lg bg-blue-600 py-2.5 px-4 text-white font-semibold
            transition-all hover:bg-blue-500 hover:shadow-lg flex items-center justify-center gap-2"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
