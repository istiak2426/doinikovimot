import Header from '@/components/Header'
import Footer from '@/components/Footer'
import GoogleAnalytics from '@/components/GoogleAnalytics' 

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  ),
  title: {
    default: 'মিমবাজ (MemeBaz)',
    template: '%s | MemeBaz (মিমবাজ)',
  },
  description: 'ভাইরাল মিমস, ট্রেন্ডস, ফ্যাশন ও স্যাটায়ার — মিমবাজ (MemeBaz)',
  openGraph: {
    siteName: 'MemeBaz (মিমবাজ)',
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
