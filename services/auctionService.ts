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
        throw new Error("Please install MetaMask wallet");
      }

      // Check current wallet
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

      try {
        // Try to switch to Hardhat network (chainId: 31337)
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x7A69" }], // Hex for 31337
        });
      } catch (switchError: any) {
        // If network doesn't exist, try to add it
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x7A69", // Hex for 31337
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
              throw new Error("User rejected network addition");
            }
            throw new Error("Failed to add network. Please add Hardhat network manually");
          }
        } else if (switchError.code === 4001) {
          throw new Error("User rejected network switch");
        } else {
          throw switchError;
        }
      }

      // Verify current network
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId !== "0x7A69") {
        throw new Error("Please ensure you are connected to Hardhat network");
      }

      console.log("Successfully connected to Hardhat network");
    } catch (error: any) {
      console.error("Network switch failed:", error);
      throw new Error(
        error.message ||
          "Network switch failed. Please ensure MetaMask is installed and Hardhat network is added"
      );
    }
  }

  private async getContract(): Promise<ethers.Contract> {
    try {
      // 检查是否在客户端环境
      if (typeof window === 'undefined') {
        throw new Error('This method is only available in browser environment');
      }

      if (!this.contract) {
        if (!window.ethereum) {
          throw new Error("Please install MetaMask wallet");
        }

        this.provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await this.provider.getSigner();
        if (!signer) {
          console.error("Signer is not available. Please connect your wallet.");
          return;
        }
        const contractAddress = process.env.NEXT_PUBLIC_AUCTION_CONTRACT_ADDRESS;

        if (!contractAddress) {
          throw new Error("Auction contract address not configured");
        }

        this.contract = new ethers.Contract(
          contractAddress,
          AuctionManagerABI.abi,
          signer
        );
        console.log("Contract instance created successfully");
      }
      return this.contract;
    } catch (error) {
      console.error("Failed to get contract instance:", error);
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

      console.log("Checking NFT:", {
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
          throw new Error(
            `Token ID ${tokenId} does not exist. Current max Token ID is ${tokenCounter - 1n}`
          );
        }

        // 检查所有权
        const owner = await nftContractInstance.ownerOf(tokenId);
        if (owner.toLowerCase() !== signerAddress.toLowerCase()) {
          throw new Error(
            `You are not the owner of this NFT. Owner: ${owner}, Your address: ${signerAddress}`
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
        console.log("Checking NFT approval status...");
        const approvedAddress = await nftContractInstance.getApproved(tokenId);
        console.log("Current approved address:", approvedAddress);
        console.log("Target approval address:", auctionAddress);

        if (approvedAddress.toLowerCase() !== auctionAddress.toLowerCase()) {
          console.log("Approval needed, preparing approval transaction...");

          // 准备交易参数
          const approveTx = {
            to: nftContract,
            data: nftContractInstance.interface.encodeFunctionData("approve", [
              auctionAddress,
              tokenId,
            ]),
          };

          console.log("Transaction parameters:", approveTx);

          // 发送交易
    

          try {
            const tx = await signer.sendTransaction(approveTx);
            await tx.wait(); // 等待交易确认
            console.log("DAT approved successfully");
        } catch (error) {
            console.error("Failed to send transaction:", error);
        }

          // 验证授权是否成功
          const newApprovedAddress = await nftContractInstance.getApproved(
            tokenId
          );
          if (
            newApprovedAddress.toLowerCase() !== auctionAddress.toLowerCase()
          ) {
            throw new Error("NFT approval failed, please try again");
          }
        }

        // 获取 NFT 元数据
        const tokenURI = await nftContractInstance.tokenURI(tokenId);
        return await this.getNFTMetadata(tokenURI);
      } catch (error: any) {
        console.error("NFT approval failed:", error);
        if (error.code === 4001) {
          throw new Error("User rejected approval request");
        }
        throw error;
      }
    } catch (error: any) {
      console.error("NFT approval failed:", error);
      if (error.code === 4001) {
        throw new Error("User rejected approval request");
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

      console.log("Creating auction parameters:", {
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
      console.log("Auction created successfully, transaction hash:", tx.hash);
      return tx.hash;
    } catch (error) {
      console.error("Failed to create auction:", error);
      throw error;
    }
  }

  public async bid(auctionId: string, bidAmount: number): Promise<void> {
    try {
      const contract = await this.getContract();
      
      // 将出价金额转换为 BigNumber
      const bidAmountWei = ethers.parseEther(bidAmount.toString());
      
      console.log('Bid parameters:', {
        auctionId,
        bidAmountWei: bidAmountWei.toString(),
      });

      // 调用合约的 bid 方法，传入两个参数
      const tx = await contract.bid(
        auctionId,  // auctionId 作为第一个参数
        bidAmountWei // bidAmount 作为第二个参数
      );
      
      console.log('Bid transaction sent:', tx.hash);

      // 等待交易确认
      const receipt = await tx.wait();
      console.log('Bid transaction confirmed:', receipt);
    } catch (error) {
      console.error('Failed to place bid:', error);
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

  public async checkAllowance(auctionId: string, amount: string): Promise<BigNumber> {
    const datTokenAddress = process.env.NEXT_PUBLIC_DAT_CONTRACT_ADDRESS;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const datContract = new ethers.Contract(datTokenAddress, datTokenAbi, signer);
    const auctionAddress = await this.getContract().getAddress();
    
    return await datContract.allowance(await signer.getAddress(), auctionAddress);
  }
  
  public async approve(auctionId: string, amount: string): Promise<void> {
    const datTokenAddress = process.env.NEXT_PUBLIC_DAT_CONTRACT_ADDRESS;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const datContract = new ethers.Contract(datTokenAddress, datTokenAbi, signer);
    const auctionAddress = await this.getContract().getAddress();
    const amountWei = ethers.parseEther(amount);
  
    const approveTx = {
      to: datTokenAddress,
      data: datContract.interface.encodeFunctionData("approve", [
        auctionAddress,
        amountWei,
      ]),
    };
  
    const tx = await signer.sendTransaction(approveTx);
    await tx.wait();
  }

  public async deposit(auctionId: string, depositAmount: string): Promise<void> {
    try {
      const datTokenAddress = process.env.NEXT_PUBLIC_DAT_CONTRACT_ADDRESS;

      if (!datTokenAddress) {
        throw new Error("DAT contract address not configured");
      }

      // 创建 Provider 和 Signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      // DAT Token 的 ABI
      const datTokenAbi = [
        "function approve(address spender, uint256 amount) returns (bool)",
        "function allowance(address owner, address spender) view returns (uint256)"
      ];

      const datContract = new ethers.Contract(datTokenAddress, datTokenAbi, signer);
      const contract = await this.getContract(); // 获取拍卖合约实例
      const auctionAddress = await contract.getAddress(); // 获取拍卖合约地址
      const depositAmountWei = ethers.parseEther(depositAmount); // 将押金金额转换为 Wei

      console.log('Checking DAT allowance...');
      const allowance = await datContract.allowance(signerAddress, auctionAddress);

      // 检查授权额度
      if (allowance < depositAmountWei) {
        console.log('Requesting DAT approval...');
        
        // 准备交易参数
        const approveTx = {
          to: datTokenAddress, // DAT 合约地址
          data: datContract.interface.encodeFunctionData("approve", [
            auctionAddress,
            depositAmountWei,
          ]),
        };

        console.log("Transaction parameters:", approveTx);
        try {
          // 发送交易以请求授权
          const tx = await signer.sendTransaction(approveTx);
          await tx.wait(); // 等待交易确认
          console.log("DAT approved successfully");
        } catch (error) {
          console.error("Failed to send approval transaction:", error);
          throw new Error("Approval transaction failed");
        }
      }

      // 发送押金交易
      console.log('Sending deposit transaction...');
      const depositTx = await contract.deposit(auctionId, {
        gasLimit: 1000000 // 设定一个合理的 gas limit
      });
      await depositTx.wait(); // 等待押金交易确认
      console.log('Deposit payment confirmed');
    } catch (error: any) {
      console.error('Failed to pay deposit:', error);
      throw error;
    }
  }

  public async getDATBalance(address: string): Promise<string> {
    try {
      const datTokenAddress = process.env.NEXT_PUBLIC_DAT_CONTRACT_ADDRESS;
      
      if (!datTokenAddress) {
        throw new Error("DAT contract address not configured");
      }
      
      // 确保 provider 已初始化
      const provider = await this.blockchainService.getProvider();
      
      // DAT Token 的基础 ABI
      const datTokenAbi = [
        "function balanceOf(address account) view returns (uint256)",
        "function decimals() view returns (uint8)"
      ];

      const datContract = new ethers.Contract(
        datTokenAddress,
        datTokenAbi,
        provider
      );

      const balance = await datContract.balanceOf(address);
      const decimals = await datContract.decimals();
      
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      console.error("Failed to get DAT balance:", error);
      throw error;
    }
  }
}
