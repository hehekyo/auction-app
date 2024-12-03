'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import CreateBidModal from '@/components/CreateBidModal';
import { MdToken } from "react-icons/md";
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAuctionDetails, clearCurrentAuction } from '@/store/auctionSlice';

export default function AuctionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentAuction, loading, error } = useAppSelector((state) => state.auctions);
  const [nftImageUrl, setNftImageUrl] = useState<string>('');
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);

  useEffect(() => {
    if (params.id) {
      dispatch(fetchAuctionDetails(params.id as string));
    }
    return () => {
      dispatch(clearCurrentAuction());
    };
  }, [dispatch, params.id]);

  useEffect(() => {
    if (currentAuction?.auctionDetails) {
      const imageUrl = currentAuction.auctionDetails.tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
      setNftImageUrl(imageUrl);
    }
  }, [currentAuction]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (error || !currentAuction) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center text-gray-400">
            <p>{error || 'Auction not found'}</p>
            <button
              onClick={() => router.push('/auctions')}
              className="mt-4 text-blue-500 hover:text-blue-400"
            >
              Back to Auctions
            </button>
          </div>
        </div>
      );
    }

    const { auctionDetails, bidHistory } = currentAuction;

    return (
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/auctions')}
          className="mb-6 text-gray-400 hover:text-gray-300 flex items-center gap-2"
        >
          ← Back to Auctions
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* NFT Image Display */}
          <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-800">
            {nftImageUrl ? (
              <Image
                src={nftImageUrl}
                alt={`NFT #${auctionDetails.tokenId}`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                <div className="animate-pulse bg-gray-700 rounded-lg w-full h-full" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-gray-400">NFT Contract:</p>
                  <p className="text-sm text-gray-200 break-all">{auctionDetails.nftContract}</p>
                  <p className="text-gray-400 mt-4">Token ID:</p>
                  <p className="text-gray-200">{auctionDetails.tokenId}</p>
                </div>
              </div>
            )}
          </div>

          {/* Auction Details */}
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-gray-100">Auction #{auctionDetails.auctionId}</h1>
            
            <div className="bg-gray-800 rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Current Bid</span>
                <div className="flex items-center gap-2 text-2xl font-bold text-gray-100">
                  <MdToken className="text-blue-400" />
                  <span>{auctionDetails.highestBid} DAT</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">Reserve Price</span>
                <div className="flex items-center gap-2 text-gray-200">
                  <MdToken className="text-blue-400" />
                  <span>{auctionDetails.reservePrice} DAT</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">Highest Bidder</span>
                <span className="text-gray-200">
                  {auctionDetails.highestBidder || "No bids yet"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">End Time</span>
                <span className="text-gray-200">
                  {new Date(Number(auctionDetails.endTime) * 1000).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">Seller</span>
                <span className="text-gray-200">{auctionDetails.seller}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">Deposit Required</span>
                <div className="flex items-center gap-2 text-gray-200">
                  <MdToken className="text-blue-400" />
                  <span>{auctionDetails.depositAmount} DAT</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">Auction Type</span>
                <span className="text-gray-200">
                  {auctionDetails.auctionType === '0' ? 'English Auction' : 'Dutch Auction'}
                </span>
              </div>
            </div>

            {/* Bid History */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-100 mb-4">Bid History</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-gray-300">
                  <thead>
                    <tr className="text-gray-400 text-sm">
                      <th className="text-left pb-4">Bidder</th>
                      <th className="text-left pb-4">Amount</th>
                      <th className="text-left pb-4">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bidHistory.length > 0 ? (
                      bidHistory.map((bid, index) => (
                        <tr key={index} className="border-t border-gray-700">
                          <td className="py-3">{bid.bidder}</td>
                          <td className="py-3">{bid.amount} DAT</td>
                          <td className="py-3">
                            {new Date(Number(bid.timestamp) * 1000).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="text-center py-4 text-gray-400">
                          No bid history yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <button
              onClick={() => setIsBidModalOpen(true)}
              className="w-full py-4 rounded-xl text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              Place Bid
            </button>
          </div>
        </div>

        {/* Bid Modal */}
        <CreateBidModal
          isOpen={isBidModalOpen}
          onClose={() => {
            setIsBidModalOpen(false);
            dispatch(fetchAuctionDetails(params.id as string));
          }}
          auctionId={auctionDetails.auctionId}
          minBid={Number(auctionDetails.startingPrice)}
          highestBid={Number(auctionDetails.highestBid)}
        />
      </div>
    );
  };

  return renderContent();
} 