// app/[lang]/article/[id]/page.js

import { supabase } from '@/lib/supabase'
import DynamicArticleClient from './DynamicArticleClient'

// 🔥 Helper: Get correct OG image URL (CRITICAL FIX)
function getOgImage(rawImage, baseUrl) {
  if (!rawImage) {
    return `${baseUrl}/og-image.png`
  }

  try {
    // ❌ If Next.js optimized image → extract real URL
    if (rawImage.includes('/_next/image')) {
      const urlParam = new URL(rawImage).searchParams.get('url')
      if (urlParam) {
        return decodeURIComponent(urlParam)
      }
    }

    // ✅ If already absolute URL
    if (rawImage.startsWith('http')) {
      return rawImage
    }

    // ✅ Relative path
    return `${baseUrl}${rawImage}`

  } catch (err) {
    console.error('OG Image parse error:', err)
    return `${baseUrl}/og-image.png`
  }
}

// 🔥 Facebook / SEO Metadata
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

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    'https://doinikobhimot.vercel.app'

  const title =
    (isBn && data.title_bn) ||
    data.title ||
    'Article'

  const description =
    (isBn && data.excerpt_bn) ||
    data.excerpt ||
    'Read more'

  const imageUrl = getOgImage(data.featured_image, baseUrl)

  const url = `${baseUrl}/${lang}/article/${id}`

  return {
    title: `${title} | Doinik Obhimot`,
    description,

    openGraph: {
      title,
      description,
      url,
      siteName: 'Doinik Obhimot',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
        // 🔥 fallback for Facebook compatibility
        {
          url: imageUrl.replace('.webp', '.jpg'),
        },
      ],
      type: 'article',
      publishedTime: data.published_at,
      authors: [data.author || 'Doinik Obhimot'],
      locale: isBn ? 'bn_BD' : 'en_US',
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      site: '@doinikobhimot',
      creator: '@doinikobhimot',
    },

    alternates: {
      canonical: url,
    },

    robots: {
      index: true,
      follow: true,
    },

    // 🔥 EXTRA fallback (VERY IMPORTANT for Facebook)
    other: {
      'og:image': imageUrl,
      'og:image:secure_url': imageUrl,
      'og:image:type': 'image/jpeg',
      'og:image:width': '1200',
      'og:image:height': '630',
    },
  }
}

// 🔥 Page render
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

// 🔥 Static params (optional)
export async function generateStaticParams() {
  const { data } = await supabase
    .from('articles')
    .select('id')
    .limit(100)

  return data?.map((article) => ({
    id: article.id.toString(),
  })) || []
}

// 🔥 Simple 404
function NotFoundPage() {
  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h1>404</h1>
      <p>Article not found</p>
    </div>
  )
}
