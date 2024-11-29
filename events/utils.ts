import { ethers } from 'ethers';

export async function getBlockTimestamp(
  provider: ethers.Provider, 
  blockNumber: number
): Promise<number | null> {
  try {
    const block = await provider.getBlock(blockNumber);
    return block?.timestamp || null;
  } catch (error) {
    console.error('Error fetching block timestamp:', error);
    return null;
  }
} 