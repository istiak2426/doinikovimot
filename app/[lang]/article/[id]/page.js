// app/[lang]/article/[id]/page.js
import { supabase } from '@/lib/supabase'
import DynamicArticleClient from './DynamicArticleClient'

// 🔥 Facebook / SEO (Prothom Alo style preview)
export async function generateMetadata({ params }) {
  const { id, lang } = params

  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single()

  if (!data) {
    return { title: 'Article Not Found' }
  }

  const isBn = lang === 'bn'

  const title = (isBn && data.title_bn) || data.title || 'Article'
  const description = (isBn && data.excerpt_bn) || data.excerpt || 'Read more'
  
  // ✅ FIX 1: Ensure absolute URL with proper domain
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://doinikobhimot.vercel.app'
  const imageUrl = data.featured_image 
    ? (data.featured_image.startsWith('http') 
        ? data.featured_image 
        : `${baseUrl}${data.featured_image}`)
    : `${baseUrl}/og-image.png` // Create a default OG image

  const url = `${baseUrl}/${lang}/article/${id}`

  return {
    title: `${title} | Doinik Obhimot`,
    description,
    
    // ✅ FIX 2: Add all required OG tags
    openGraph: {
      title: title,
      description: description,
      url: url,
      siteName: 'Doinik Obhimot',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
          type: 'image/jpeg',
        },
      ],
      type: 'article',
      publishedTime: data.published_at,
      authors: [data.author || 'Doinik Obhimot'],
      locale: isBn ? 'bn_BD' : 'en_US',
    },
    
    // ✅ FIX 3: Add complete Twitter card
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [imageUrl],
      site: '@doinikobhimot', // Add your Twitter handle
      creator: '@doinikobhimot',
    },
    
    // ✅ FIX 4: Add basic meta tags for compatibility
    alternates: {
      canonical: url,
    },
    
    robots: {
      index: true,
      follow: true,
    },
  }
}

// 🔥 Page render (server → client)
export default async function Page({ params }) {
  const { id } = params

  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single()

  if (!data) {
    return <NotFoundPage />
  }

  return <DynamicArticleClient initialArticle={data} />
}

// Optional: Add a head component for extra meta tags
export async function generateStaticParams() {
  // Optional: Pre-generate popular articles for faster loading
  const { data } = await supabase
    .from('articles')
    .select('id')
    .limit(100)
  
  return data?.map((article) => ({
    id: article.id.toString(),
  })) || []
}