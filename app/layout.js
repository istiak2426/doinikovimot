import { Inter } from 'next/font/google'
import './globals.css'
import GoogleTagManager from '@/components/GoogleTagManager'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  metadataBase: new URL('https://doinikobhimot.vercel.app'),
  title: 'মিমবাজ (MemeBaz) - ভাইরাল মিমস, ট্রেন্ডস, ফ্যাশন ও স্যাটায়ার',
  description: 'ইন্টারনেটের তাজা ভাইরাল মিমস, সমকালীন ফ্যাশন রোস্ট, ট্রোল ও স্যাটায়ারের প্ল্যাটফর্ম — মিমবাজ (MemeBaz)',
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
