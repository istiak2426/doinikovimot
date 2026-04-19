import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Doinik Obhimot - Your Trusted News Source',
  description: 'Latest news, breaking stories, and in-depth analysis',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=yes',
}

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=yes" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
