import { sepolia } from "viem/chains";
import { PublicClient, createPublicClient, http } from 'viem'
import { mainnet,localhost } from 'viem/chains'

export const viemClients = (chaiId: number): PublicClient => {
  const clients: {
    [key: number]: PublicClient
  } = {
    // [sepolia.id]: createPublicClient({
    //   chain: sepolia,
    //   transport: http()
    // }),
    [localhost.id]: createPublicClient({
      chain: localhost,
      transport: http()
    })
  }
  return clients[chaiId]
}