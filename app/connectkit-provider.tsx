'use client'

import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { hardhat } from "wagmi/chains";

// 自定义 Hardhat 配置
const customHardhatChain = {
  ...hardhat,
  id: 31337,
  name: 'Hardhat',
  network: 'hardhat',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
    public: {
      http: ['http://127.0.0.1:8545'],
    }
  },
  blockExplorers: {
    default: { name: 'Hardhat', url: 'http://localhost:8545' },
  },
  testnet: true
};

const config = createConfig(
  getDefaultConfig({
    chains: [customHardhatChain],
    transports: {
      [customHardhatChain.id]: http('http://127.0.0.1:8545'),
    },

    walletConnectProjectId: process.env.WALLETCONNECT_PROJECT_ID || "",
    appName: 'Nextjs14 ConnectKit',
    appDescription: 'Nextjs14 - ConnectKit',
    appUrl: 'https://family.co',
    appIcon: 'https://family.co/logo.png',

    // 添加额外的配置选项
    features: {
      "ensResolution": false
    }
  }),
);

const queryClient = new QueryClient();

export const ConnectkitProvider = ({ children }: any) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          options={{
            hideNoENSAvatar: true,
            hideBalance: false,
            hideENS: true,
          }}
        >
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}