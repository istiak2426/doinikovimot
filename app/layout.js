import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Doinik Obhimot - Your Trusted News Source',
  description: 'Latest news, breaking stories, and in-depth analysis',
  // এখানে গুগল ভেরিফিকেশন কোডটি যোগ করা হয়েছে
  verification: {
    google: 'FEHK6fNl0IHA00l_pH2MuePSw1P15LM6Eyq0O27pU7w',
  },
}

// Next.js এর নতুন ভার্সনে viewport আলাদাভাবে ডিক্লেয়ার করা হয়
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
        {children}
      </body>
    </html>
  )
}
