import { supabase } from '@/lib/supabase'
import DynamicArticleClient from './DynamicArticleClient'

// Default OG image (place this file in /public/og-image.png)
const DEFAULT_OG_IMAGE = '/og-image.png'

/**
 * 🔥 Extract REAL image URL (fix for Next.js _next/image + relative paths)
 */
function getOgImage(rawImage, baseUrl) {
  // Return default image if no image is provided
  if (!rawImage) {
    return new URL(DEFAULT_OG_IMAGE, baseUrl).href
  }

  try {
    let imageUrl = rawImage

    // Case 1: It's a Next.js optimized image URL → extract the 'url' parameter
    if (imageUrl.includes('/_next/image')) {
      // Ensure we have an absolute URL to parse correctly
      const absoluteUrl = imageUrl.startsWith('http')
        ? imageUrl
        : new URL(imageUrl, baseUrl).href
      const urlObject = new URL(absoluteUrl)
      const extractedUrl = urlObject.searchParams.get('url')
      if (extractedUrl) {
        imageUrl = decodeURIComponent(extractedUrl)
      }
    }

    // Case 2: Already absolute URL
    if (imageUrl.startsWith('http')) {
      return imageUrl
    }

    // Case 3: Relative path (e.g., "/images/photo.jpg")
    return new URL(imageUrl, baseUrl).href
  } catch (error) {
    console.error('❌ getOgImage error:', error, 'Raw value:', rawImage)
    return new URL(DEFAULT_OG_IMAGE, baseUrl).href
  }
}

/**
 * 🔥 Detect image MIME type from extension (for correct og:image:type)
 */
function getImageMimeType(url) {
  if (!url) return null
  const ext = url.split('.').pop()?.toLowerCase()
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
  if (ext === 'png') return 'image/png'
  if (ext === 'webp') return 'image/webp'
  if (ext === 'gif') return 'image/gif'
  return null
}

/**
 * 🔥 SEO + Facebook Metadata (fully fixed)
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
      robots: { index: false },
    }
  }

  const isBn = lang === 'bn'
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    'https://doinikobhimot.vercel.app'

  const title = (isBn && data.title_bn) || data.title || 'Article'
  const description =
    (isBn && data.excerpt_bn) || data.excerpt || 'Read more'

  // ✅ Get clean image URL (never _next/image)
  const imageUrl = getOgImage(data.featured_image, baseUrl)
  const imageMimeType = getImageMimeType(imageUrl)

  const url = `${baseUrl}/${lang}/article/${id}`

  // Build openGraph images array
  const ogImages = [
    {
      url: imageUrl,
      width: 1200,
      height: 630,
      alt: title,
    },
  ]

  // Add mime type only if detected (helps Facebook)
  if (imageMimeType) {
    ogImages[0].type = imageMimeType
  }

  return {
    title: `${title} | Doinik Obhimot`,
    description,

    openGraph: {
      title,
      description,
      url,
      siteName: 'Doinik Obhimot',
      images: ogImages,
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

    // ✅ Extra Facebook tags (dynamic type)
    other: {
      'og:image': imageUrl,
      'og:image:secure_url': imageUrl,
      ...(imageMimeType && { 'og:image:type': imageMimeType }),
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
 * 🔥 Pre-generate static pages (FIXED: includes both lang and id)
 */
export async function generateStaticParams() {
  const { data: articles } = await supabase
    .from('articles')
    .select('id')
    .limit(100)

  if (!articles) return []

  const languages = ['en', 'bn']
  const params = []

  for (const article of articles) {
    for (const lang of languages) {
      params.push({
        lang: lang,
        id: article.id.toString(),
      })
    }
  }

  return params
}

/**
 * 🔥 Simple 404 component
 */
function NotFoundPage() {
  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h1>404</h1>
      <p>Article not found</p>
    </div>
  )
}
