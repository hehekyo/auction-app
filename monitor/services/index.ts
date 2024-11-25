import { EventListener } from './eventListener'
import { config } from '../config'

async function main() {
  const listener = new EventListener(
    config.wsUrl,
    config.contractAddress,
    config.contractAbi
  )

  try {
    await listener.startListening()

    // 处理进程退出
    process.on('SIGINT', async () => {
      await listener.stopListening()
      process.exit(0)
    })

    process.on('SIGTERM', async () => {
      await listener.stopListening()
      process.exit(0)
    })

  } catch (error) {
    console.error('启动失败:', error)
    process.exit(1)
  }
}

main() 