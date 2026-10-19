import { Inter } from 'next/font/google'
import './globals.css'
import GoogleTagManager from '@/components/GoogleTagManager'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  metadataBase: new URL('https://doinikobhimot.vercel.app'),
  title: 'ওরে নেতা রে (Ore Neta Re) - ভাইরাল মিমস, স্যাটায়ার ও পলিটিক্যাল রোস্ট',
  description: 'রাজনীতি, নেতাদের কাণ্ডকারখানা, ভাইরাল মিমস, ফ্যাশন ও ট্রেন্ডসের খোলামেলা স্যাটায়ার পোর্টাল — ওরে নেতা রে (Ore Neta Re)',
  robots: {
    index: true,
    follow: true,
  },
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
      <head>
        {/* AdSense Verification Code */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4990238729287088"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className={inter.className}>
        <GoogleTagManager />
        {children}
      </body>
    </html>
  )
}
