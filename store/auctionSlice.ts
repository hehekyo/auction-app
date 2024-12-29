import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AuctionService } from "@/services/auctionService";

export interface Auction {
  auctionType: string;
  transactionHash: string;
  auctionId: string;
  seller: string;
  nftAddress: string;
  tokenId: string;
  tokenURI: string;
  startingAt: string;
  endingAt: string;
  startingPrice: string;
  status: string;
  highestBid: string;
  highestBidder: string;
  bidders: Array<{ bidder: string; bidAmount: string; bidTime: string }>;
}

interface BidEvent {
  bidder: string;
  amount: string;
  timestamp: string;
}

interface AuctionState {
  auctions: Auction[];
  currentAuction: Auction | null;
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
  "auctions/fetchAuctions",
  async () => {
    try {
      const auctions = await auctionService.getAuctions();
      return auctions;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to fetch auctions"
      );
    }
  }
);

export const fetchAuctionDetail = createAsyncThunk(
  "auctions/fetchAuctionDetail",
  async (auctionId: string) => {
    try {
      const details = await auctionService.getAuctionDetail(auctionId);
      return { auctionDetails: details };
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to fetch auction details"
      );
    }
  }
);

const auctionSlice = createSlice({
  name: "auctions",
  initialState,
  reducers: {
    clearCurrentAuction: (state) => {
      state.currentAuction = null;
    },
    clearError: (state) => {
      state.error = null;
    },
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
        state.error = action.error.message || "Failed to fetch auctions";
      })
      // 处理获取拍卖详情
      .addCase(fetchAuctionDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuctionDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAuction = action.payload;
      })
      .addCase(fetchAuctionDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch auction details";
      });
  },
});

export const { clearCurrentAuction, clearError } = auctionSlice.actions;
export default auctionSlice.reducer;
