import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ConnectkitProvider } from './connectkit-provider'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DAuction',
  description: 'DAuction',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConnectkitProvider
          customTheme={{
            "--ck-accent-color": "#00D54B",
            "--ck-accent-text-color": "#ffffff",
          }}
        >{children}</ConnectkitProvider>
        
        </body>
    </html>
  )
}
