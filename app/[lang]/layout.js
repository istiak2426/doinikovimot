import Header from '@/components/Header'
import Footer from '@/components/Footer'

/**
 * ✅ Set metadataBase to prevent _next/image in social tags
 * This ensures all relative URLs (including OG images) resolve correctly
 */
export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
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
  robots: {
    index: true,
    follow: true,
  },
}

export async function generateStaticParams() {
  return [{ lang: 'bn' }, { lang: 'en' }]
}

export default function LangLayout({ children, params: { lang } }) {
  return (
    <>
      <Header lang={lang} />
      <main className="min-h-screen bg-gray-50">
        {children}
      </main>
      <Footer lang={lang} />
    </>
  )
}
