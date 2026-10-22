import { Inter } from 'next/font/google'
import './globals.css'
import GoogleTagManager from '@/components/GoogleTagManager'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  metadataBase: new URL('https://doinikobhimot.com'),
  title: 'Doinik Obhimot (দৈনিক অভিমত) - ফ্যাশন, আধুনিক প্রযুক্তি ও সমকালীন লাইফস্টাইল',
  description: 'দৈনিক অভিমত: স্মার্ট ফ্যাশন, ওয়্যারেবল টেকনোলজি, আধুনিক লাইফস্টাইল ও সমকালীন সমাজ ভাবনা — Doinik Obhimot',
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
