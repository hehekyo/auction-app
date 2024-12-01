'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAccount } from 'wagmi';
import { parseEther } from 'viem';
import { MdToken } from "react-icons/md";

interface NFTDetails {
  id: string;
  name: string;
  image: string;
  price: string;
  tokenId: string;
  contractAddress: string;
  description: string;
  owner: string;
  mintTime: number;
}

export default function NFTDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [nft, setNft] = useState<NFTDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const fetchNFTDetails = async () => {
      if (!params?.id) {
        setError('Invalid NFT ID');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/nfts/${params.id}`);
        if (!response.ok) {
          throw new Error(response.statusText || 'Failed to fetch NFT details');
        }
        const data = await response.json();
        setNft(data);
      } catch (error) {
        console.error('Error:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch NFT details');
      } finally {
        setLoading(false);
      }
    };

    fetchNFTDetails();
  }, [params?.id]);

  const handlePurchase = async () => {
    if (!nft || !isConnected) return;

    try {
      setPurchasing(true);
      // TODO: 实现实际的购买逻辑
      console.log('Purchasing NFT...', {
        tokenId: nft.tokenId,
        price: nft.price,
        contractAddress: nft.contractAddress
      });
      
      // 模拟购买延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Purchase successful!');
      router.push('/nfts');
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !nft) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center text-gray-400">
          <p>{error || 'NFT not found'}</p>
          <button
            onClick={() => router.push('/nfts')}
            className="mt-4 text-blue-500 hover:text-blue-400"
          >
            Back to NFTs
          </button>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(nft.mintTime * 1000).toLocaleDateString();

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => router.push('/nfts')}
        className="mb-6 text-gray-400 hover:text-gray-300 flex items-center gap-2"
      >
        ← Back to NFTs
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* NFT Image */}
        <div className="relative aspect-square rounded-xl overflow-hidden">
          <Image
            src={nft.image}
            alt={nft.name}
            fill
            className="object-cover"
          />
        </div>

        {/* NFT Details */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-gray-100">{nft.name}</h1>
          
          <div className="bg-gray-800 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Price</span>
              <div className="flex items-center gap-2 text-2xl font-bold text-gray-100">
                <MdToken className="text-blue-400" />
                <span>{nft.price} DAT</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Token ID</span>
              <span className="text-gray-200">#{nft.tokenId}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Contract</span>
              <span className="text-gray-200">{nft.contractAddress}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Owner</span>
              <span className="text-gray-200">{nft.owner}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Mint Date</span>
              <span className="text-gray-200">{formattedDate}</span>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-100 mb-4">Description</h2>
            <p className="text-gray-400">{nft.description}</p>
          </div>

          {nft.owner.toLowerCase() !== address?.toLowerCase() && (
            <button
              onClick={handlePurchase}
              disabled={!isConnected || purchasing}
              className={`w-full py-4 rounded-xl text-lg font-bold ${
                !isConnected
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : purchasing
                  ? 'bg-blue-600 text-gray-200 cursor-wait'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } transition-colors`}
            >
              {!isConnected 
                ? 'Connect Wallet to Purchase'
                : purchasing
                ? 'Processing...'
                : `Buy for ${nft.price} DAT`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 