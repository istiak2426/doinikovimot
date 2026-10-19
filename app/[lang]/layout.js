import Header from '@/components/Header'
import Footer from '@/components/Footer'
import GoogleAnalytics from '@/components/GoogleAnalytics' 

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  ),
  title: {
    default: 'ওরে নেতা রে (Ore Neta Re)',
    template: '%s | Ore Neta Re (ওরে নেতা রে)',
  },
  description: 'রাজনীতি, নেতাদের কাণ্ডকারখানা, ভাইরাল মিমস ও স্যাটায়ার — ওরে নেতা রে (Ore Neta Re)',
  openGraph: {
    siteName: 'ওরে নেতা রে (Ore Neta Re)',
    type: 'website',
    locale: 'bn_BD',
  },
  robots: { index: true, follow: true },
}

export async function generateStaticParams() {
  return [{ lang: 'bn' }, { lang: 'en' }]
}

export default function LangLayout({ children, params }) {
  const { lang } = params   

  return (
    <>
      {/* 👇 Google Analytics কম্পোনেন্টটি এখানে বসান */}
      <GoogleAnalytics /> 
      
      <Header propLang={lang} />
      <main className="min-h-screen bg-gray-50">{children}</main>
      <Footer lang={lang} />
    </>
  )
}
