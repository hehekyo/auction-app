import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface NFT {
  id: string;
  name: string;
  image: string;
  tokenId: string;
  owner: string;
  mintTime: number;
  contractAddress: string;
}

interface NFTDetails extends NFT {
  price: string;
  description: string;
}

interface NFTState {
  nfts: NFT[];
  currentNFT: NFTDetails | null;
  loading: boolean;
  error: string | null;
}

const initialState: NFTState = {
  nfts: [],
  currentNFT: null,
  loading: false,
  error: null,
};

export const fetchNFTs = createAsyncThunk(
  'nfts/fetchNFTs',
  async () => {
    try {
      const response = await fetch('/api/nfts');
      if (!response.ok) {
        throw new Error('Failed to fetch NFTs');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch NFTs');
    }
  }
);

export const fetchNFTDetails = createAsyncThunk(
  'nfts/fetchNFTDetails',
  async (nftId: string) => {
    try {
      const response = await fetch(`/api/nfts/${nftId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch NFT details');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch NFT details');
    }
  }
);

const nftSlice = createSlice({
  name: 'nfts',
  initialState,
  reducers: {
    clearCurrentNFT: (state) => {
      state.currentNFT = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNFTs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNFTs.fulfilled, (state, action) => {
        state.loading = false;
        state.nfts = action.payload;
      })
      .addCase(fetchNFTs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch NFTs';
      })
      .addCase(fetchNFTDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNFTDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentNFT = action.payload;
      })
      .addCase(fetchNFTDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch NFT details';
      });
  },
});

export const { clearCurrentNFT, clearError } = nftSlice.actions;
export default nftSlice.reducer; 