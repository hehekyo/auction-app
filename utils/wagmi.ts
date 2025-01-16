import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
  hardhat,
  localhost,
  Chain
} from 'wagmi/chains';
// from https://cloud.walletconnect.com/
const ProjectId = 'bcda842b6df399d700fc4f69398382bd'


export const config = getDefaultConfig({
  appName: 'Rcc Stake',
  projectId: ProjectId,
  chains: [
    localhost
  ],
  ssr: true,
});

export const defaultChainId: number = localhost.id