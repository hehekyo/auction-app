import { configureStore } from '@reduxjs/toolkit';
import auctionReducer from './auctionSlice';
import nftReducer from './nftSlice';

export const store = configureStore({
  reducer: {
    auctions: auctionReducer,
    nfts: nftReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 