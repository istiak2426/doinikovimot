import Footer from '@/components/Footer'

export default function ArticleLayout({ children, params: { lang } }) {
  return (
    <>
      {/* No Header - avoids login wall and makes articles public */}
      <main className="min-h-screen bg-gray-50">
        {children}
      </main>
      <Footer lang={lang} />
    </>
  )
}

// Force static generation for better performance
export const dynamic = 'force-static'