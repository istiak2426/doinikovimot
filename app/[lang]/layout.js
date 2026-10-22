import Header from '@/components/Header'
import Footer from '@/components/Footer'
import GoogleAnalytics from '@/components/GoogleAnalytics' 

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  ),
  title: {
    default: 'Doinik Obhimot | দৈনিক অভিমত - ফ্যাশন, প্রযুক্তি ও সমকালীন লাইফস্টাইল',
    template: '%s | Doinik Obhimot (দৈনিক অভিমত)',
  },
  description: 'দৈনিক অভিমত: স্মার্ট ফ্যাশন, ওয়্যারেবল টেকনোলজি, আধুনিক লাইফস্টাইল ও সমকালীন সমাজ ভাবনা — Doinik Obhimot',
  openGraph: {
    siteName: 'Doinik Obhimot (দৈনিক অভিমত)',
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
      <GoogleAnalytics /> 
      <Header propLang={lang} />
      <main className="min-h-screen bg-[#FAF8F5]">{children}</main>
      <Footer lang={lang} />
    </>
  )
}
