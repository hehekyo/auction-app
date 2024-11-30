import Image from 'next/image';
import { FaEthereum } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { MdToken } from "react-icons/md";

interface NFTCardProps {
  id: string;
  name: string;
  image: string;
  price: string;
  tokenId: string;
  contractAddress: string;
}

export default function NFTCard({ id, name, image, price, tokenId, contractAddress }: NFTCardProps) {
  const router = useRouter();

  return (
    <div 
      className="bg-gray-800 rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-105 cursor-pointer"
      onClick={() => router.push(`/nfts/${id}`)}
    >
      <div className="relative aspect-square">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
        />
      </div>
      
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-100 mb-2">{name}</h3>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span>Token ID:</span>
            <span className="text-gray-200">{tokenId}</span>
          </div>
          
          <div className="flex items-center justify-between text-gray-400">
            <span>Price:</span>
            <div className="flex items-center gap-1 text-gray-200">
              <MdToken className="text-blue-400" />
              <span>{price} DAT</span>
            </div>
          </div>
          
          <div className="mt-3">
            <p className="text-gray-400 text-sm truncate">
              Contract: {contractAddress}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 