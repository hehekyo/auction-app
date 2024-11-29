'use client';

import { useState, useEffect } from 'react';
import NFTCard from '@/components/NFTCard';

interface NFT {
  id: string;
  name: string;
  image: string;
  price: string;
  tokenId: string;
  contractAddress: string;
}

export default function NFTsPage() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        const response = await fetch('/api/nfts');
        if (!response.ok) {
          throw new Error('Failed to fetch NFTs');
        }
        const data = await response.json();
        setNfts(data);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
        setError('Failed to load NFTs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl mb-4">😕</p>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-100">NFT Collection</h1>
      
      {nfts.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <p>No NFTs found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {nfts.map((nft) => (
            <NFTCard
              key={nft.id}
              {...nft}
            />
          ))}
        </div>
      )}
    </div>
  );
} 