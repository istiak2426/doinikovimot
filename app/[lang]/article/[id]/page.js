// app/[lang]/article/[id]/page.js

import { supabase } from '@/lib/supabase'
import DynamicArticleClient from './DynamicArticleClient'

/**
 * 🔥 Extract REAL image URL (fix for Next.js _next/image issue)
 */
function getOgImage(rawImage, baseUrl) {
  if (!rawImage) return `${baseUrl}/og-image.png`

  try {
    // ✅ Case 1: Next.js optimized image → extract original
    if (rawImage.includes('/_next/image')) {
      const extracted = new URL(rawImage).searchParams.get('url')
      if (extracted) return decodeURIComponent(extracted)
    }

    // ✅ Case 2: Already absolute URL
    if (rawImage.startsWith('http')) return rawImage

    // ✅ Case 3: Relative path
    return `${baseUrl}${rawImage}`
  } catch (err) {
    console.error('OG Image error:', err)
    return `${baseUrl}/og-image.png`
  }
}

/**
 * 🔥 Convert WebP → JPG fallback (for Facebook compatibility)
 */
function getSafeImage(imageUrl) {
  if (!imageUrl) return imageUrl

  // Some crawlers don't support webp properly
  if (imageUrl.endsWith('.webp')) {
    return imageUrl.replace('.webp', '.jpg')
  }

  return imageUrl
}

/**
 * 🔥 SEO + Facebook Metadata
 */
export async function generateMetadata({ params }) {
  const { id, lang } = params

  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single()

  if (!data) {
    return {
      title: 'Article Not Found',
    }
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

  // 🔥 MAIN FIX
  const rawImage = getOgImage(data.featured_image, baseUrl)
  const safeImage = getSafeImage(rawImage)

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
          url: safeImage,
          width: 1200,
          height: 630,
          alt: title,
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
      images: [safeImage],
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

    // 🔥 EXTRA Facebook fallback tags (IMPORTANT)
    other: {
      'og:image': safeImage,
      'og:image:secure_url': safeImage,
      'og:image:type': 'image/jpeg',
      'og:image:width': '1200',
      'og:image:height': '630',
    },
  }
}

/**
 * 🔥 Page render
 */
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

/**
 * 🔥 Optional: Pre-generate pages
 */
export async function generateStaticParams() {
  const { data } = await supabase
    .from('articles')
    .select('id')
    .limit(100)

  return (
    data?.map((article) => ({
      id: article.id.toString(),
    })) || []
  )
}

/**
 * 🔥 Simple 404
 */
function NotFoundPage() {
  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h1>404</h1>
      <p>Article not found</p>
    </div>
  )
}
