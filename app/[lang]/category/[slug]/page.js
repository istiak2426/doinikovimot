'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Sparkles, ArrowUpRight, Cpu, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import { bn } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'
import { CURATED_FASHION_ARTICLES } from '@/lib/fashionArticles'
import LoadingSpinner from '@/components/LoadingSpinner'

const FALLBACK_CATEGORY_MAP = {
  opinion: { bn: 'সম্পাদকীয় ও অভিমত', en: 'Editorial & Opinion', desc_bn: 'দৈনিক অভিমতের সম্পাদকীয় বিশ্লেষণ, কলামিস্টদের দৃষ্টিকোণ ও গভীর মননশীল পাঠ', desc_en: 'Editorial analysis, columnist perspectives, and contemplative essays from Doinik Obhimot.' },
  'smart-fashion': { bn: 'স্মার্ট ফ্যাশন', en: 'Smart Fashion', desc_bn: 'অপটিক-ফাইবার বুনন, বায়োমেট্রিক ফেব্রিক ও হাই-এন্ড ক্যুট্যুর', desc_en: 'Optic-fiber textiles, biometric fabrics, and high-end couture.' },
  wearables: { bn: 'ওয়্যারেবলস', en: 'Wearables', desc_bn: 'টাইটানিয়াম স্মার্টওয়াচ, অডিও সানগ্লাস ও সিরামিক স্মার্ট রিং', desc_en: 'Titanium smartwatches, audio eyewear, and ceramic smart rings.' },
  techwear: { bn: 'আরবান টেকওয়্যার', en: 'Urban Techwear', desc_bn: 'জলরোধী মেমব্রেন, ম্যাগনেটিক ফিডলক ও ট্যাকটিক্যাল স্ট্রিটওয়্যার', desc_en: 'Waterproof membranes, magnetic Fidlock, and tactical street fits.' },
  'digital-couture': { bn: 'ডিজিটাল ক্যুট্যুর', en: 'Digital Couture', desc_bn: 'এআই ও থ্রিডি জেনারেটিভ ডিজাইন, ভার্চুয়াল অ্যাভাটার ও বর্জ্যহীন ফ্যাশন', desc_en: 'AI generative draping, 3D avatars, and zero-waste virtual runways.' },
  'style-satire': { bn: 'রসবোধ ও স্যাটায়ার', en: 'Culture Satire', desc_bn: 'গ্যাজেট ও টেক কালচারের মজার বৈপরীত্য, মিমস ও স্যাটায়ার', desc_en: 'Humorous fashion-tech observations, memes, and cultural parodies.' },
  lifestyle: { bn: 'লাইফস্টাইল', en: 'Lifestyle', desc_bn: 'ডিজিটাল নোম্যাডদের দৈনন্দিন নান্দনিকতা ও পরিমিতিবোধ', desc_en: 'Minimalist aesthetics and mindful tech living for digital nomads.' },
  fashion: { bn: 'ফ্যাশন', en: 'Fashion', desc_bn: 'আন্তর্জাতিক ফ্যাশন রানওয়ে ও সমকালীন ডিজাইন', desc_en: 'Global runways and contemporary tailored design.' },
  style: { bn: 'স্টাইল ও সৌন্দর্য', en: 'Style & Beauty', desc_bn: 'গ্রুমিং, এক্সেসরিজ ও পার্সোনাল স্টাইল স্টেটমেন্ট', desc_en: 'Personal styling, grooming, and luxury everyday accessories.' },
}

export default function CategoryPage() {
  const params = useParams()
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug
  const lang = Array.isArray(params.lang) ? params.lang[0] : params.lang
  const isBn = lang === 'bn'

  const [articles, setArticles] = useState([])
  const [categoryName, setCategoryName] = useState(slug || 'Category')
  const [categoryDesc, setCategoryDesc] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (slug) {
      fetchCategoryArticles()
      fetchCategoryInfo()
    }
  }, [slug, lang])

  async function fetchCategoryArticles() {
    setLoading(true)
    setError(null)
    const lowerSlug = (slug || '').toLowerCase()

    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .ilike('category', `%${slug}%`)
        .eq('status', 'published')
        .order('published_at', { ascending: false })

      const dbArticles = data || []

      // Match curated fashion-tech articles intelligently
      const matchingCurated = CURATED_FASHION_ARTICLES.filter((a) => {
        const cat = (a.category || '').toLowerCase()
        if (lowerSlug.includes('smart') || lowerSlug === 'fashion') return cat.includes('fashion')
        if (lowerSlug.includes('wearable')) return cat.includes('wearable')
        if (lowerSlug.includes('techwear')) return cat.includes('techwear')
        if (lowerSlug.includes('digital') || lowerSlug.includes('couture')) return cat.includes('couture')
        if (lowerSlug.includes('satire') || lowerSlug.includes('meme')) return cat.includes('satire')
        if (lowerSlug === 'lifestyle') return true
        return cat.includes(lowerSlug)
      })

      const seenIds = new Set(dbArticles.map((a) => a.id))
      const combined = [...dbArticles]
      matchingCurated.forEach((a) => {
        if (!seenIds.has(a.id)) {
          combined.push(a)
        }
      })

      // If nothing in database matches, fall back to matching curated or all curated
      if (combined.length === 0) {
        setArticles(matchingCurated.length > 0 ? matchingCurated : CURATED_FASHION_ARTICLES.slice(0, 3))
      } else {
        setArticles(combined)
      }
    } catch (err) {
      console.warn('Failed to fetch category articles from DB, using curated:', err)
      const matching = CURATED_FASHION_ARTICLES.filter((a) => {
        const cat = (a.category || '').toLowerCase()
        if (lowerSlug.includes('wearable')) return cat.includes('wearable')
        if (lowerSlug.includes('techwear')) return cat.includes('techwear')
        if (lowerSlug.includes('digital') || lowerSlug.includes('couture')) return cat.includes('couture')
        if (lowerSlug.includes('satire')) return cat.includes('satire')
        return true
      })
      setArticles(matching.length > 0 ? matching : CURATED_FASHION_ARTICLES)
    } finally {
      setLoading(false)
    }
  }

  async function fetchCategoryInfo() {
    const lowerSlug = (slug || '').toLowerCase()
    const fallback = FALLBACK_CATEGORY_MAP[lowerSlug]

    if (fallback) {
      setCategoryName(isBn ? fallback.bn : fallback.en)
      setCategoryDesc(isBn ? fallback.desc_bn : fallback.desc_en)
      return
    }

    try {
      const { data } = await supabase
        .from('categories')
        .select('name_bn, name_en')
        .eq('slug', lowerSlug)
        .maybeSingle()

      if (data) {
        setCategoryName(isBn ? data.name_bn || data.name_en : data.name_en || data.name_bn)
      } else {
        setCategoryName(slug)
      }
    } catch {
      setCategoryName(slug)
    }
  }

  const formatDate = (date) => {
    if (!date) return ''
    try {
      return format(new Date(date), 'PP', {
        locale: isBn ? bn : undefined,
      })
    } catch {
      return date
    }
  }

  const getTitle = (a) => (isBn && a.title_bn ? a.title_bn : a.title)
  const getExcerpt = (a) => (isBn && a.excerpt_bn ? a.excerpt_bn : a.excerpt || '')

  if (loading) return <LoadingSpinner />

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-10 font-sans text-stone-900 pb-24">
      <div className="container-custom max-w-screen-xl space-y-8">
        
        {/* Back Link */}
        <Link
          href={`/${lang}`}
          className="inline-flex items-center gap-2 text-xs font-medium text-stone-600 hover:text-teal-900 transition"
        >
          <ArrowLeft size={16} />
          <span className="font-serif">
            {isBn ? 'দৈনিক অভিমত হোমপেজে ফিরুন' : 'Back to Home'}
          </span>
        </Link>

        {/* Category Header */}
        <div className="border-b border-stone-200/80 pb-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-teal-800">
            <Cpu size={14} />
            <span>{isBn ? 'সম্পাদকীয় ও বিষয়ভিত্তিক সংকলন' : 'EDITORIAL & TOPIC COLLECTION'}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-black text-stone-900">
            {categoryName}
          </h1>
          {categoryDesc && (
            <p className="text-stone-500 text-sm max-w-2xl leading-relaxed">
              {categoryDesc}
            </p>
          )}
        </div>

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-stone-200/80 text-stone-500">
            <p>{isBn ? 'এই ক্যাটাগরিতে বর্তমানে কোনো আর্টিকেল নেই।' : 'No articles found in this category yet.'}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/${lang}/article/${article.id}`}
                className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-stone-200/80 hover:border-stone-300 shadow-2xs hover:shadow-xs transition duration-200"
              >
                <div className="relative aspect-[16/10] w-full bg-stone-100 overflow-hidden">
                  <Image
                    src={article.featured_image || '/images/fashiontech/hero.jpg'}
                    alt={getTitle(article)}
                    fill
                    className="object-cover group-hover:scale-104 transition duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-xs text-stone-800 px-2 py-0.5 rounded text-[11px] font-mono font-medium">
                    {article.category}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h2 className="font-serif font-bold text-base text-stone-900 group-hover:text-teal-800 transition line-clamp-2 leading-snug">
                      {getTitle(article)}
                    </h2>
                    <p className="text-stone-600 text-xs leading-relaxed line-clamp-3">
                      {getExcerpt(article)}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                    <span className="truncate max-w-[140px]">{article.author}</span>
                    <span className="inline-flex items-center gap-1 text-teal-800 font-medium">
                      <span>{isBn ? 'পড়ুন' : 'Read'}</span>
                      <ArrowUpRight size={13} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}