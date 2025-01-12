import { Providers } from "@/app/providers";
import { Contract, getAddress, ZeroAddress } from "ethers";
import { BrowserProvider, JsonRpcProvider, JsonRpcSigner } from "ethers";
import { ROUTER_ADDRESS } from "./constants";

export function isAddress(value: any): string | false {
  try {
    return getAddress(value);
  } catch {
    return false;
  }
}

export async function getSigner(
  library: BrowserProvider,
  account: string
): Promise<JsonRpcSigner> {
  return await library.getSigner(account);
}

export function getProviderOrSigner(
  library: BrowserProvider,
  account?: string
): BrowserProvider | Promise<JsonRpcSigner> {
  return account ? getSigner(library, account) : library;
}

export function getContract(
  address: string,
  ABI: any,
  library: BrowserProvider,
  account?: string
): Contract {
  if (!isAddress(address) || address === ZeroAddress) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }

  return new Contract(
    address,
    ABI,
    getProviderOrSigner(library, account) as any
  );
}

// export function getRouterContract(
//   _: number,
//   library: BrowserProvider,
//   account?: string
// ): Contract {
//   return getContract(ROUTER_ADDRESS, IUniswapV2Router02ABI, library, account);
// }
