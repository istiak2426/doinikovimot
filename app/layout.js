import { Inter } from 'next/font/google'
import './globals.css'
// ১. GTM কম্পোনেন্ট ইমপোর্ট করুন
import GoogleTagManager from '@/components/GoogleTagManager'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Doinik Obhimot - Your Trusted News Source',
  description: 'Latest news, breaking stories, and in-depth analysis',
  verification: {
    google: 'FEHK6fNl0IHA00l_pH2MuePSw1P15LM6Eyq0O27pU7w',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
}

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body className={inter.className}>
        {/* ২. GTM কম্পোনেন্টটি বডির একদম শুরুতে বসান */}
        <GoogleTagManager />
        
        {children}
      </body>
    </html>
  )
}
