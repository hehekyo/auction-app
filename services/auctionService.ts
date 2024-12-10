import { ethers } from "ethers";
import AuctionManagerABI from "../abi/AuctionManager.json";
import { BlockchainService } from "./blockchainService";

export interface AuctionStartedEvent {
  transactionHash: string;
  blockNumber: number;
  timestamp: number | null;
  args: {
    auctionId: string;
    seller: string;
    nftContract: string;
    tokenId: string;
    tokenURI: string;
    auctionType: string;
    startingPrice: string;
    reservePrice: string;
    duration: string;
    depositAmount: string;
    startTime: string;
    endTime: string;
  };
}

export interface BidEvent {
  bidder: string;
  amount: string;
  timestamp: string;
}

export interface AuctionDetails {
  auctionId: string;
  seller: string;
  nftContract: string;
  tokenId: string;
  tokenURI: string;
  auctionType: string;
  startingPrice: string;
  reservePrice: string;
  duration: string;
  depositAmount: string;
  startTime: string;
  endTime: string;
  highestBid: string;
  highestBidder: string;
}

export interface NFTMetadata {
  name: string;
  image: string;
  tokenURI: string;
}

export class AuctionService {
  private static instance: AuctionService;
  private blockchainService: BlockchainService;
  private contract: ethers.Contract | null = null;
  private provider: ethers.BrowserProvider | null = null;

  private constructor() {
    this.blockchainService = BlockchainService.getInstance();
  }

  public static getInstance(): AuctionService {
    if (!AuctionService.instance) {
      AuctionService.instance = new AuctionService();
    }
    return AuctionService.instance;
  }

  private formatDATAmount(amount: bigint, decimals: number = 18): string {
    return ethers.formatUnits(amount, decimals);
  }

  private async resetHardhatNetwork(): Promise<void> {
    try {
      if (!window.ethereum) {
        throw new Error("请安装 MetaMask 钱包");
      }

      // 检查当前使用的钱包
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

      try {
        // 尝试切换到 Hardhat 网络 (chainId: 31337)
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x7A69" }], // 31337 的十六进制
        });
      } catch (switchError: any) {
        // 如果网络不存在，则尝试添加网络
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x7A69", // 31337 的十六进制
                  chainName: "Hardhat Local",
                  nativeCurrency: {
                    name: "ETH",
                    symbol: "ETH",
                    decimals: 18,
                  },
                  rpcUrls: ["http://127.0.0.1:8545"],
                },
              ],
            });
          } catch (addError: any) {
            if (addError.code === 4001) {
              throw new Error("用户拒绝添加网络");
            }
            throw new Error("添加网络失败，请手动添加 Hardhat 网络");
          }
        } else if (switchError.code === 4001) {
          throw new Error("用户拒绝切换网络");
        } else {
          throw switchError;
        }
      }

      // 验证当前网络
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId !== "0x7A69") {
        // 31337 的十六进制
        throw new Error("请确保已连接到 Hardhat 网络");
      }

      console.log("已成功连接到 Hardhat 网络");
    } catch (error: any) {
      console.error("网络切换失败:", error);
      throw new Error(
        error.message ||
          "网络切换失败，请确保使用 MetaMask 并已添加 Hardhat 网络"
      );
    }
  }

  private async getContract(): Promise<ethers.Contract> {
    try {
      if (!this.contract) {
        if (!window.ethereum) {
          throw new Error("请安装 MetaMask 钱包");
        }

        this.provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await this.provider.getSigner();
        const contractAddress =
          process.env.NEXT_PUBLIC_AUCTION_CONTRACT_ADDRESS;

        if (!contractAddress) {
          throw new Error("Auction contract address not configured");
        }

        this.contract = new ethers.Contract(
          contractAddress,
          AuctionManagerABI.abi,
          signer
        );
        console.log("合约实例创建成功");
      }
      return this.contract;
    } catch (error) {
      console.error("获取合约实例失败:", error);
      throw error;
    }
  }

  private async getNFTMetadata(tokenURI: string): Promise<NFTMetadata> {
    try {
      // 将 ipfs:// 转换为 https://ipfs.io/ipfs/
      const url = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
      console.log('====nft url', url);
      
      return {
        name: 'NFT #1', // 这里可以根据需要设置默认名称
        image: url,     // 直接使用转换后的 URL
        tokenURI: url
      };
    } catch (error) {
      console.error('Failed to get NFT metadata:', error);
      return {
        name: 'Unknown NFT',
        image: '',
        tokenURI
      };
    }
  }

  public async getNFTInfo(
    nftContract: string,
    tokenId: number
  ): Promise<NFTMetadata> {
    try {
      const signer = await this.provider!.getSigner();
      const nftContractInstance = new ethers.Contract(
        nftContract,
        ["function tokenURI(uint256) view returns (string)"],
        signer
      );

      const tokenURI = await nftContractInstance.tokenURI(Number(tokenId));
      return await this.getNFTMetadata(tokenURI);
    } catch (error) {
      console.error("Failed to get NFT info:", error);
      throw error;
    }
  }

  public async approveNFT(
    nftContract: string,
    tokenId: number
  ): Promise<NFTMetadata> {
    try {
      const contract = await this.getContract();
      const signer = await this.provider!.getSigner();
      const auctionAddress = await contract.getAddress();
      const signerAddress = await signer.getAddress();

      console.log("检查 NFT:", {
        nftContract,
        tokenId,
        auctionAddress,
        signerAddress,
      });

      // 使用完整的 DANFT ABI
      const nftContractInstance = new ethers.Contract(
        nftContract,
        [
          "function ownerOf(uint256 tokenId) view returns (address)",
          "function isApprovedForAll(address owner, address operator) view returns (bool)",
          "function setApprovalForAll(address operator, bool approved)",
          "function tokenURI(uint256 tokenId) view returns (string)",
          "function approve(address to, uint256 tokenId)",
          "function getApproved(uint256 tokenId) view returns (address)",
          "function tokenCounter() view returns (uint256)",
        ],
        signer
      );

      try {
        // 首先检查代币是否存在
        const tokenCounter = await nftContractInstance.tokenCounter();
        if (BigInt(tokenId) >= tokenCounter) {
          // 确保 tokenId 是 BigInt 类型
          throw new Error(
            `Token ID ${tokenId} 不存在。当前最大 Token ID 为 ${
              tokenCounter - 1n
            }`
          ); // 使用 BigInt
        }

        // 检查所有权
        const owner = await nftContractInstance.ownerOf(tokenId);
        if (owner.toLowerCase() !== signerAddress.toLowerCase()) {
          throw new Error(
            `你不是此 NFT 的所有者。所有者: ${owner}, 你的地址: ${signerAddress}`
          );
        }

        // 检查是否已经完全授权
        // const isApprovedForAll = await nftContractInstance.isApprovedForAll(signerAddress, auctionAddress);
        // if (!isApprovedForAll) {
        //   console.log('请求用户授权所有 NFT...');
        //   const tx = await nftContractInstance.setApprovalForAll(auctionAddress, true);
        //   await tx.wait();
        //   console.log('用户已授权所有 NFT');
        // }

        // 检查特定 NFT 的授权状态
        console.log("检查 NFT 授权状态...");
        const approvedAddress = await nftContractInstance.getApproved(tokenId);
        console.log("当前授权地址:", approvedAddress);
        console.log("目标授权地址:", auctionAddress);

        if (approvedAddress.toLowerCase() !== auctionAddress.toLowerCase()) {
          console.log("需要授权，准备发送授权交易...");

          // 准备交易参数
          const approveTx = {
            to: nftContract,
            data: nftContractInstance.interface.encodeFunctionData("approve", [
              auctionAddress,
              tokenId,
            ]),
          };

          // 发送交易
          console.log("发送授权交易...");
          const tx = await signer.sendTransaction(approveTx);
          console.log("授权交易已发送:", tx.hash);

          // 等待交易确认
          console.log("等待交易确认...");
          const receipt = await tx.wait();
          console.log("授权交易已确认:", receipt);

          // 验证授权是否成功
          const newApprovedAddress = await nftContractInstance.getApproved(
            tokenId
          );
          if (
            newApprovedAddress.toLowerCase() !== auctionAddress.toLowerCase()
          ) {
            throw new Error("NFT 授权失败，请重试");
          }
        }

        // 获取 NFT 元数据
        const tokenURI = await nftContractInstance.tokenURI(tokenId);
        return await this.getNFTMetadata(tokenURI);
      } catch (error: any) {
        console.error("NFT 检查失败:", error);

        if (
          error.message.includes("ERC721NonexistentToken") ||
          error.data?.message?.includes("ERC721NonexistentToken")
        ) {
          throw new Error(`Token ID ${tokenId} 不存在`);
        }

        if (error.message.includes("execution reverted")) {
          const customError = error.data?.message || error.message;
          if (customError.includes("ERC721NonexistentToken")) {
            throw new Error(`Token ID ${tokenId} 不存在`);
          }
        }

        throw error;
      }
    } catch (error: any) {
      console.error("NFT 授权失败:", error);
      if (error.code === 4001) {
        throw new Error("用户拒绝了授权请求");
      }
      throw error;
    }
  }

  public async createAuction(
    auctionType: number,
    startingPrice: number,
    reservePrice: number,
    duration: number,
    nftContract: string,
    tokenId: number,
    priceDecrement: number = 0,
    decrementInterval: number = 0
  ): Promise<string> {
    try {
      // await this.resetHardhatNetwork();
      // await this.approveNFT(nftContract, tokenId);

      const contract = await this.getContract();

      const startingPriceWei = ethers.parseEther(startingPrice.toString());
      const reservePriceWei = ethers.parseEther(reservePrice.toString());
      const priceDecrementWei = ethers.parseEther(priceDecrement.toString());

      console.log("创建拍卖参数:", {
        auctionType,
        startingPriceWei,
        reservePriceWei,
        duration,
        nftContract,
        tokenId,
        priceDecrementWei,
        decrementInterval,
      });

      const tx = await contract.startAuction(
        auctionType,
        startingPriceWei,
        reservePriceWei,
        duration,
        nftContract,
        tokenId,
        priceDecrementWei,
        decrementInterval
      );

      const receipt = await tx.wait();
      console.log("拍卖创建成功，交易哈希:", tx.hash);
      return tx.hash;
    } catch (error) {
      console.error("创建拍卖失败:", error);
      throw error;
    }
  }

  public async placeBid(auctionId: string, bidAmount: number): Promise<void> {
    try {
      const contract = await this.getContract();
      const signer = await this.provider!.getSigner();
  
      // 将出价金额转换为 Wei
      const bidAmountWei = ethers.parseEther(bidAmount.toString());
  
      console.log('出价参数:', {
        auctionId,
        bidAmountWei: bidAmountWei.toString(),
      });
  
      // 调用合约的出价方法
      const tx = await contract.placeBid(auctionId, { value: bidAmountWei });
      console.log('出价交易已发送:', tx.hash);
  
      // 等待交易确认
      const receipt = await tx.wait();
      console.log('出价交易已确认:', receipt);
    } catch (error) {
      console.error('出价失败:', error);
      throw error;
    }
  }
  
  // 获取拍卖列表
  public async getAuctions(): Promise<AuctionStartedEvent[]> {
    try {
      const provider = await this.blockchainService.getProvider();
      const contractAddress = process.env.NEXT_PUBLIC_AUCTION_CONTRACT_ADDRESS;

      if (!contractAddress) {
        throw new Error("Auction contract address not configured");
      }

      const contract = new ethers.Contract(
        contractAddress,
        AuctionManagerABI.abi,
        provider
      );
      const latestBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, latestBlock - 10000);

      const events = await contract.queryFilter(
        "AuctionStarted",
        fromBlock,
        latestBlock
      );
      const formattedEvents = await Promise.all(
        events.map(async (event: any) => {
          const block = await provider.getBlock(event.blockNumber);
          const timestamp = block ? block.timestamp : null;

          const [
            auctionId,
            seller,
            nftContract,
            tokenId,
            tokenURI,
            auctionType,
            startingPrice,
            reservePrice,
            duration,
            depositAmount,
            startTime,
            endTime,
          ] = event.args;

          return {
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber,
            timestamp,
            args: {
              auctionId: auctionId.toString(),
              seller,
              nftContract,
              tokenId: tokenId.toString(),
              tokenURI,
              auctionType: auctionType.toString(),
              startingPrice: this.formatDATAmount(startingPrice),
              reservePrice: this.formatDATAmount(reservePrice),
              duration: duration.toString(),
              depositAmount: this.formatDATAmount(depositAmount),
              startTime: startTime.toString(),
              endTime: endTime.toString(),
            },
          };
        })
      );

      return formattedEvents;
    } catch (error) {
      console.error("Failed to fetch auctions:", error);
      throw error;
    }
  }

  // 获取拍卖详情
  public async getAuctionDetails(auctionId: string): Promise<{
    auctionDetails: AuctionDetails;
    bidHistory: BidEvent[];
  }> {
    try {
      const provider = await this.blockchainService.getProvider();
      const contractAddress = process.env.NEXT_PUBLIC_AUCTION_CONTRACT_ADDRESS;

      if (!contractAddress) {
        throw new Error("Auction contract address not configured");
      }

      const contract = new ethers.Contract(
        contractAddress,
        AuctionManagerABI.abi,
        provider
      );

      const auctionEvents = await contract.queryFilter("AuctionStarted");
      const auctionEvent = auctionEvents.find(
        (event: any) => event.args[0].toString() === auctionId
      );

      if (!auctionEvent) {
        throw new Error("Auction not found");
      }

      const [
        auctionIdArg,
        seller,
        nftContract,
        tokenId,
        tokenURI,
        auctionType,
        startingPrice,
        reservePrice,
        duration,
        depositAmount,
        startTime,
        endTime,
      ] = auctionEvent.args;

      const bidEvents = await contract.queryFilter("BidPlaced");
      const auctionBidEvents = bidEvents.filter(
        (event: any) => event.args[0].toString() === auctionId
      );

      const bids = auctionBidEvents.map((event: any) => {
        const [, bidder, bidAmount, timestamp] = event.args;
        return {
          bidder,
          amount: this.formatDATAmount(bidAmount),
          timestamp: timestamp.toString(),
        };
      });

      const sortedBids = [...bids].sort(
        (a, b) => parseFloat(b.amount) - parseFloat(a.amount)
      );
      const highestBid = sortedBids[0] || {
        amount: "0",
        bidder: ethers.ZeroAddress,
      };

      const auctionDetails: AuctionDetails = {
        auctionId: auctionIdArg.toString(),
        seller,
        nftContract,
        tokenId: tokenId.toString(),
        tokenURI,
        auctionType: auctionType.toString(),
        startingPrice: this.formatDATAmount(startingPrice),
        reservePrice: this.formatDATAmount(reservePrice),
        duration: duration.toString(),
        depositAmount: this.formatDATAmount(depositAmount),
        startTime: startTime.toString(),
        endTime: endTime.toString(),
        highestBid: highestBid.amount,
        highestBidder: highestBid.bidder,
      };

      return {
        auctionDetails,
        bidHistory: bids,
      };
    } catch (error) {
      console.error("Failed to fetch auction details:", error);
      throw error;
    }
  }
}
