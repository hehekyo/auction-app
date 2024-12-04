'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NFTCard from '@/components/NFTCard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchNFTs } from '@/store/nftSlice';
import { log } from 'console';

export default function NFTsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { nfts, loading, error } = useAppSelector((state) => state.nfts);

  useEffect(() => {
    dispatch(fetchNFTs());
  }, [dispatch]);

  const handleViewDetail = (nftId: string) => {
    router.push(`/nfts/${nftId}`);
  };
  console.log("============nfts=============",nfts);
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-500">NFT Collection</h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-red-500 text-center">
            <p className="text-xl mb-4">😕</p>
            <p>{error}</p>
            <button 
              onClick={() => dispatch(fetchNFTs())} 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Retry
            </button>
          </div>
        </div>
      ) : nfts.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <p>No NFTs found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {nfts.map((nft) => (
            <NFTCard
              key={nft.id}
              {...nft}
              onViewDetail={() => handleViewDetail(nft.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
} 