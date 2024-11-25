import { abi as auctionABI } from './abi/AuctionManager.json'
export const config = {
    wsUrl: 'http://127.0.0.1:8545',  // 或者其他以太坊节点的 WebSocket URL
    contractAddress: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',     // 你的合约地址
    contractAbi: auctionABI           // 你的合约 ABI
  }