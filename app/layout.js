import { Inter } from 'next/font/google'
import './globals.css'
import GoogleTagManager from '@/components/GoogleTagManager'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  metadataBase: new URL('https://doinikobhimot.vercel.app'), // এটি খুবই জরুরি
  title: 'Doinik Obhimot - Your Trusted News Source',
  description: 'Latest news, breaking stories, and in-depth analysis',
  robots: {
    index: true,  // Google-কে পেজ ইনডেক্স করার অনুমতি দিচ্ছে
    follow: true, // লিংক ফলো করার অনুমতি দিচ্ছে
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
      <body className={inter.className}>
        <GoogleTagManager />
        {children}
      </body>
    </html>
  )
}
