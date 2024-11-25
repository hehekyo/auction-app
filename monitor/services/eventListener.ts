import { 
  Contract, 
  providers,
} from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import { Logger } from '../utils/logger'

interface AuctionCreatedEvent {
  auctionId: string
  seller: string
  nftContract: string
  tokenId: string
  auctionType: number
  startingPrice: string
  reservePrice: string
  duration: string
  depositAmount: string
  blockNumber: number
  transactionHash: string
}

interface BidPlacedEvent {
  auctionId: string
  bidder: string
  bidAmount: string
  timestamp: string
  blockNumber: number
  transactionHash: string
}

interface CreateAuctionApiParams {
  sellerAddress: string;
  minBid: string;
  endTime: string;
  nftContract: string;
  tokenId: string;
  auctionId: string;
  auctionType: number;
  startingPrice: string;
  reservePrice: string;
  depositAmount: string;
  transactionHash: string;
}

interface CreateBidApiParams {
  auctionId: string;
  bidderAddress: string;
  bidAmount: string;
  timestamp: string;
  transactionHash: string;
}

const logger = new Logger('EventListener')

export class EventListener {
  private provider: providers.WebSocketProvider | null = null
  private contract: Contract | null = null
  private isListening: boolean = false
  private reconnectAttempts = 0
  private readonly maxReconnectAttempts = 5
  private readonly reconnectDelay = 5000 // 5秒

  constructor(
    private readonly wsUrl: string,
    private readonly contractAddress: string,
    private readonly contractAbi: any[]
  ) {
    logger.info('初始化事件监听器', { wsUrl, contractAddress })
    this.initializeProvider()
  }

  private async initializeProvider() {
    try {
      this.provider = new providers.WebSocketProvider(this.wsUrl)
      logger.info('Provider 初始化成功')

      // 初始化合约
      this.contract = new Contract(
        this.contractAddress,
        this.contractAbi,
        this.provider
      )

      // 监听连接状态
      this.provider.on('error', (error) => {
        logger.error('WebSocket连接错误:', error)
        this.reconnect()
      })

      this.provider.on('disconnect', () => {
        logger.warn('Provider 断开连接')
        this.handleDisconnect()
      })

      logger.info('Provider 初始化成功')
    } catch (error) {
      logger.error('Provider 初始化失败:', error)
      throw error
    }
  }

  private async handleDisconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('达到最大重连次数')
      return
    }

    this.reconnectAttempts++
    logger.info(`尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)

    try {
      // 清理旧的监听器
      await this.stopListening()
      
      // 等待一段时间后重连
      await new Promise(resolve => setTimeout(resolve, this.reconnectDelay))
      
      // 重新初始化
      await this.initializeProvider()
      
      // 如果之前在监听，则重新开始监听
      if (this.isListening) {
        await this.startListening()
      }

      this.reconnectAttempts = 0
      logger.info('重连成功')
    } catch (error) {
      logger.error('重连失败:', error)
      // 递归尝试重连
      this.handleDisconnect()
    }
  }

  async startListening() {
    if (this.isListening) {
      logger.warn('已经在监听中')
      return
    }

    if (!this.contract) {
      throw new Error('合约实例未初始化')
    }

    try {
      // 监听拍卖创建事件
      this.contract.on('AuctionCreated', async (...args) => {
        const event = args[args.length - 1]
        const [
          auctionId,
          seller,
          nftContract,
          tokenId,
          auctionType,
          startingPrice,
          reservePrice,
          duration,
          depositAmount
        ] = args

        // 转换价格从 Wei 到 ETH
        const startingPriceEth = formatEther(startingPrice)
        const reservePriceEth = formatEther(reservePrice)
        const depositAmountEth = formatEther(depositAmount)

        const auctionData = {
          auctionId: auctionId.toString(),
          seller,
          nftContract,
          tokenId: tokenId.toString(),
          auctionType: Number(auctionType),
          startingPrice: startingPriceEth,
          reservePrice: reservePriceEth,
          duration: duration.toString(),
          depositAmount: depositAmountEth,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash
        }

        logger.info('新拍卖创建:', auctionData)

        // 计算结束时间
        const currentBlock = await this.provider!.getBlock('latest')
        const endTime = new Date(
          (currentBlock!.timestamp + Number(duration)) * 1000
        ).toISOString()

        // 调用 API 创建拍卖记录
        try {
          const response = await fetch('http://localhost:3000/api/auctions/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sellerAddress: seller,
              minBid: startingPriceEth,
              endTime: endTime,
              nftContract: nftContract,
              tokenId: tokenId.toString(),
              auctionId: auctionId.toString(),
              auctionType: Number(auctionType),
              startingPrice: startingPriceEth,
              reservePrice: reservePriceEth,
              depositAmount: depositAmountEth,
              transactionHash: event.transactionHash
            } as CreateAuctionApiParams)
          })

          if (!response.ok) {
            throw new Error(`API 调用失败: ${response.statusText}`)
          }

          const result = await response.json()
          logger.info('拍卖记录已创建:', result)
        } catch (error) {
          logger.error('创建拍卖记录失败:', error)
        }
      })

      // 监听出价事件
      this.contract.on('BidPlaced', async (...args) => {
        const event = args[args.length - 1]
        const [auctionId, bidder, bidAmount, timestamp] = args

        const bidData = {
          auctionId: auctionId.toString(),
          bidder,
          bidAmount: formatEther(bidAmount),
          timestamp: new Date(Number(timestamp) * 1000).toISOString(),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash
        }

        logger.info('新出价:', bidData)

        // 调用 API 创建投标记录
        try {
          const response = await fetch('http://localhost:3000/api/bids/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              auctionId: bidData.auctionId,
              bidderAddress: bidData.bidder,
              bidAmount: bidData.bidAmount,
              timestamp: bidData.timestamp,
              transactionHash: bidData.transactionHash
            } as CreateBidApiParams)
          });

          if (!response.ok) {
            throw new Error(`API 调用失败: ${response.statusText}`)
          }

          const result = await response.json()
          logger.info('投标记录已创建:', result)
        } catch (error) {
          logger.error('创建投标记录失败:', error)
        }
      })

      this.isListening = true
      logger.info('开始监听拍卖事件...')
    } catch (error) {
      logger.error('启动监听失败:', error)
      throw error
    }
  }

  async stopListening() {
    if (!this.isListening) return

    try {
      // 移除所有事件监听器
      if (this.contract) {
        this.contract.removeAllListeners()
      }
      // 关闭连接
      if (this.provider) {
        await this.provider.destroy()
      }
      
      this.isListening = false
      logger.info('停止监听拍卖事件')
    } catch (error) {
      logger.error('停止监听失败:', error)
    }
  }

  private async reconnect() {
    try {
      logger.info('尝试重新连接...')
      
      // 清理现有连接
      if (this.contract) {
        this.contract.removeAllListeners()
      }
      if (this.provider) {
        await this.provider.destroy()
      }

      // 重新初始化
      await this.initializeProvider()
      
      logger.info('重新连接成功')
    } catch (error) {
      logger.error('重新连接失败:', error)
      // 可以选择添加重试逻辑
      setTimeout(() => this.reconnect(), 5000) // 5秒后重试
    }
  }
} 