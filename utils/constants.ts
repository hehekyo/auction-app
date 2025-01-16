export const INIT_CODE_HASH =
  "0xbdbe86a1ceedc764dab738a3d57098c3ec1f3abdf2d23177487dedb8c7412fb6";

export const WETH_ADDRESS = "0x75500b3581048efde93b84b5290403258908434f";
export const FACTORY_ADDRESS = "0x113179d684c7f205cc6edc82aa3ab7f7e8baaf10";
export const ROUTER_ADDRESS = "0xe1bda121687eb0fa46cf23df10b3737816ebd311";
export const QUERY_ADDRESS = "0x5bb488549b153236098be268317441d05817c935";

export const AUCTION_ADDRESS = "0x5cd19ad5545bdcad89c608eac9bc7bd1d45d5fb3";
export const NFT_ADDRESS = "0xd4731527b48cc6a62432025af5ab5a5047b10833";
export const DAT_ADDRESS = "0x99c655d71b71c822300ce40e93abe671e5b8e249";

export enum ChainId {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  GÖRLI = 5,
  KOVAN = 42,
  SEPOLIA = 11155111,
}

export enum TradeType {
  EXACT_INPUT,
  EXACT_OUTPUT,
}

export enum Rounding {
  ROUND_DOWN,
  ROUND_HALF_UP,
  ROUND_UP,
}
