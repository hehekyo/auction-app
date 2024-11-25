export class Logger {
  constructor(private context: string) {}

  info(message: string, ...args: any[]) {
    this.log('INFO', message, ...args)
  }

  warn(message: string, ...args: any[]) {
    this.log('WARN', message, ...args)
  }

  error(message: string, ...args: any[]) {
    this.log('ERROR', message, ...args)
  }

  private log(level: string, message: string, ...args: any[]) {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${this.context}] ${level}:`
    
    if (args.length > 0) {
      console.log(prefix, message, ...args)
    } else {
      console.log(prefix, message)
    }
  }
} 