import Header from '@/components/Header'
import Footer from '@/components/Footer'

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