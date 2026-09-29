import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  ),
  title: {
    default: 'Doinik Obhimot',
    template: '%s | Doinik Obhimot',
  },
  description: 'Latest news, articles, and updates from Doinik Obhimot',
  openGraph: {
    siteName: 'Doinik Obhimot',
    type: 'website',
    locale: 'en_US',
  },
  robots: { index: true, follow: true },
}

export async function generateStaticParams() {
  return [{ lang: 'bn' }, { lang: 'en' }]
}

export default function LangLayout({ children, params }) {
  const { lang } = params   // Next.js 14

  return (
    <>
      <Header propLang={lang} />
      <main className="min-h-screen bg-gray-50">{children}</main>
      <Footer lang={lang} />
    </>
  )
}