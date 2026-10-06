// app/sitemap.ts
import type { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase' // আপনার API route অনুযায়ী ইমপোর্ট

const BASE_URL = 'https://doinikobhimot.vercel.app'
const LOCALES = ['bn', 'en'] as const

// আপনার সাইটের স্ট্যাটিক পেজগুলো (ছবি থেকে নেওয়া)
const STATIC_PAGES = [
  { path: '', priority: 1.0, freq: 'daily' },          // হোমপেজ
  { path: 'about', priority: 0.5, freq: 'monthly' },
  { path: 'contact', priority: 0.5, freq: 'monthly' },
  { path: 'disclaimer', priority: 0.3, freq: 'yearly' },
  { path: 'editorial-policy', priority: 0.3, freq: 'yearly' },
  { path: 'privacy-policy', priority: 0.3, freq: 'yearly' },
  { path: 'terms', priority: 0.3, freq: 'yearly' },
  { path: 'latest', priority: 0.8, freq: 'daily' },
  { path: 'satire', priority: 0.7, freq: 'weekly' },
] as const

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = []
  const now = new Date()

  // ─────────────────────────────────────────────
  // ১. Supabase থেকে সব পাবলিশড আর্টিকেল আনুন
  // ─────────────────────────────────────────────
  let articles: any[] = []
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('slug, category, published_at, updated_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (!error && data) {
      articles = data
    }
  } catch (err) {
    console.error('Sitemap: articles fetch failed', err)
  }

  // ─────────────────────────────────────────────
  // ২. আর্টিকেল থেকে ইউনিক ক্যাটাগরি বের করুন
  // ─────────────────────────────────────────────
  const categories = Array.from(
    new Set(articles.map((a) => a.category).filter(Boolean))
  )

  // ─────────────────────────────────────────────
  // ৩. প্রতিটি ভাষার (bn, en) জন্য URL তৈরি করুন
  // ─────────────────────────────────────────────
  for (const lang of LOCALES) {
    // ৩.১ — স্ট্যাটিক পেজ
    for (const page of STATIC_PAGES) {
      urls.push({
        url: `${BASE_URL}/${lang}${page.path ? `/${page.path}` : ''}`,
        lastModified: now,
        changeFrequency: page.freq,
        priority: page.priority,
      })
    }

    // ৩.২ — ডাইনামিক ক্যাটাগরি পেজ
    for (const cat of categories) {
      urls.push({
        url: `${BASE_URL}/${lang}/category/${cat}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.7,
      })
    }

    // ৩.৩ — ডাইনামিক আর্টিকেল পেজ
    for (const article of articles) {
      if (!article.slug) continue

      urls.push({
        url: `${BASE_URL}/${lang}/article/${article.slug}`,
        lastModified: article.updated_at
          ? new Date(article.updated_at)
          : article.published_at
          ? new Date(article.published_at)
          : now,
        changeFrequency: 'weekly',
        priority: 0.6,
      })
    }
  }

  return urls
}

// ⚡ ক্যাশিং: ১ ঘণ্টা পর পর সাইটম্যাপ রিবিল্ড হবে (DB হিট কমাতে)
export const revalidate = 3600
