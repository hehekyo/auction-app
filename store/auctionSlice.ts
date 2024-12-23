import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AuctionService } from '@/services/auctionService';

export interface Auction {
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
}

interface BidEvent {
  bidder: string;
  amount: string;
  timestamp: string;
}

interface AuctionDetails extends Auction {
  highestBid: string;
  highestBidder: string;
}

interface AuctionData {
  auctionDetails: AuctionDetails;
  bidHistory: BidEvent[];
}

interface AuctionState {
  auctions: Auction[];
  currentAuction: AuctionData | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuctionState = {
  auctions: [],
  currentAuction: null,
  loading: false,
  error: null,
};

const auctionService = AuctionService.getInstance();

export const fetchAuctions = createAsyncThunk(
  'auctions/fetchAuctions',
  async () => {
    try {
      const auctions = await auctionService.getAuctions();
      return auctions;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch auctions');
    }
  }
);

export const fetchAuctionDetails = createAsyncThunk(
  'auctions/fetchAuctionDetails',
  async (auctionId: string) => {
    try {
      const details = await auctionService.getAuctionDetails(auctionId);
      return details;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch auction details');
    }
  }
);

const auctionSlice = createSlice({
  name: 'auctions',
  initialState,
  reducers: {
    clearCurrentAuction: (state) => {
      state.currentAuction = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // 处理获取拍卖列表
      .addCase(fetchAuctions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuctions.fulfilled, (state, action) => {
        state.loading = false;
        state.auctions = action.payload;
      })
      .addCase(fetchAuctions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch auctions';
      })
      // 处理获取拍卖详情
      .addCase(fetchAuctionDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuctionDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAuction = action.payload;
      })
      .addCase(fetchAuctionDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch auction details';
      });
  },
});

export const { clearCurrentAuction, clearError } = auctionSlice.actions;
export default auctionSlice.reducer; 