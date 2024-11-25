import { ethers } from 'ethers';
import AuctionManager from '../abi/AuctionManager.json';

const auctionABI = AuctionManager.abi;

declare global {
  interface Window {
    ethereum: any;
  }
}

export class ContractService {
  private static instance: ContractService;
  private contract: ethers.Contract | null = null;
  private provider: ethers.BrowserProvider | null = null;

  private constructor() {}

  public static getInstance(): ContractService {
    if (!ContractService.instance) {
      ContractService.instance = new ContractService();
    }
    return ContractService.instance;
  }

  private async resetHardhatNetwork(): Promise<void> {
    try {
      // 直接切换到 Hardhat 网络
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x539' }]  // 使用已存在的 chainId
      });

      // 验证网络
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('当前网络 chainId:', currentChainId);

      // 请求账户权限
      await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      console.log('已切换到 Hardhat 网络');
    } catch (error: any) {
      if (error.code === 4902) {
        // 如果网络不存在，则添加
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x539',
              chainName: 'Hardhat Local',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: ['http://127.0.0.1:8545']
            }
          ]
        });
      } else {
        console.error('重置网络失败:', error);
        throw error;
      }
    }
  }

  private async getContract(): Promise<ethers.Contract> {
    try {
      if (!this.contract) {
        if (!window.ethereum) {
          throw new Error('请安装 MetaMask 钱包');
        }

        this.provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await this.provider.getSigner();
        
        this.contract = new ethers.Contract(
          "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",  // 拍卖管理合约地址
          auctionABI,
          signer
        );
        console.log('合约实例创建成功');
      }
      return this.contract;
    } catch (error) {
      console.error('获取合约实例失败:', error);
      throw error;
    }
  }

  public async approveNFT(nftContract: string, tokenId: number): Promise<void> {
    try {
      await this.resetHardhatNetwork();
      
      const contract = await this.getContract();
      const signer = await this.provider!.getSigner();
      const auctionAddress = await contract.getAddress();
      const signerAddress = await signer.getAddress();

      console.log('授权参数:', {
        nftContract,
        tokenId,
        auctionAddress,
        signerAddress
      });

      const nftContractInstance = new ethers.Contract(
        nftContract,
        [
          'function approve(address to, uint256 tokenId) public',
          'function getApproved(uint256 tokenId) view returns (address)',
          'function ownerOf(uint256) public view returns (address)',
          'function balanceOf(address) public view returns (uint256)'
        ],
        signer
      );

      // 检查所有权
      const owner = await nftContractInstance.ownerOf(tokenId);
      console.log('所有权信息:', { owner, signerAddress });

      if (owner.toLowerCase() !== signerAddress.toLowerCase()) {
        throw new Error(`你不是此 NFT 的所有者。所有者: ${owner}, 你的地址: ${signerAddress}`);
      }

      // 获取当前 nonce
      const nonce = await this.provider!.getTransactionCount(signerAddress);
      
      // 执行授权
      console.log('开始授权...', {
        from: signerAddress,
        to: nftContract,
        auctionAddress,
        tokenId,
        nonce
      });

      // 估算 gas
      const gasEstimate = await nftContractInstance.approve.estimateGas(
        auctionAddress, 
        tokenId
      );
      
      console.log('预估 gas:', gasEstimate.toString());

      // 发送交易
      const tx = await nftContractInstance.approve(
        auctionAddress, 
        tokenId,
        {
          from: signerAddress,
          nonce: nonce,
          gasLimit: Math.ceil(Number(gasEstimate) * 1.2), // 增加 20% 的 gas 限制
        }
      );
      
      console.log('授权交易已发送:', {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        data: tx.data,
        nonce: tx.nonce,
        gasLimit: tx.gasLimit.toString()
      });

      const receipt = await tx.wait();
      console.log('交易已确认:', receipt);
      
      // 验证授权
      const approved = await nftContractInstance.getApproved(tokenId);
      console.log('授权后状态:', {
        approved,
        auctionAddress,
        isApproved: approved.toLowerCase() === auctionAddress.toLowerCase()
      });

      if (approved.toLowerCase() !== auctionAddress.toLowerCase()) {
        throw new Error('授权验证失败');
      }

      console.log('NFT 授权成功');
    } catch (error: any) {
      console.error('NFT 授权失败:', error);
      if (error.data) {
        console.error('错误数据:', error.data);
      }
      if (error.transaction) {
        console.error('交易数据:', error.transaction);
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
      // 1. 确保网络连接
      await this.resetHardhatNetwork();
      
      // 2. 先进行授权
      await this.approveNFT(nftContract, tokenId);

      // 3. 创建拍卖
      const contract = await this.getContract();
      
      // 转换价格为 Wei
      const startingPriceWei = ethers.parseEther(startingPrice.toString());
      const reservePriceWei = ethers.parseEther(reservePrice.toString());
      const priceDecrementWei = ethers.parseEther(priceDecrement.toString());

      console.log('创建拍卖参数:', {
        auctionType,
        startingPriceWei,
        reservePriceWei,
        duration,
        nftContract,
        tokenId,
        priceDecrementWei,
        decrementInterval
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
      console.log('拍卖创建成功，交易哈希:', tx.hash);
      return tx.hash;
    } catch (error) {
      console.error('创建拍卖失败:', error);
      throw error;
    }
  }
} 