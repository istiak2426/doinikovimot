'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { bn } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'
import { CURATED_FASHION_ARTICLES } from '@/lib/fashionArticles'
import LoadingSpinner from '@/components/LoadingSpinner'

const FALLBACK_CATEGORY_MAP = {
  fashion: { bn: 'ফ্যাশন', en: 'Fashion' },
  style: { bn: 'স্টাইল ও সৌন্দর্য', en: 'Style & Beauty' },
  lifestyle: { bn: 'লাইফস্টাইল', en: 'Lifestyle' },
  national: { bn: 'জাতীয়', en: 'National' },
  economy: { bn: 'অর্থনীতি', en: 'Economy' },
  sports: { bn: 'খেলা', en: 'Sports' },
  entertainment: { bn: 'বিনোদন', en: 'Entertainment' },
  technology: { bn: 'প্রযুক্তি', en: 'Technology' },
  politics: { bn: 'রাজনীতি', en: 'Politics' },
  business: { bn: 'বাণিজ্য', en: 'Business' },
  satire: { bn: 'স্যাটায়ার', en: 'Satire' },
}

export default function CategoryPage() {
  const params = useParams()
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug
  const lang = Array.isArray(params.lang) ? params.lang[0] : params.lang

  const [articles, setArticles] = useState([])
  const [categoryName, setCategoryName] = useState(slug || 'Category')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const normalizedCategory = slug
    ? slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase()
    : ''

  useEffect(() => {
    if (slug) {
      fetchCategoryArticles()
      fetchCategoryName()
    }
  }, [slug, lang])

  async function fetchCategoryArticles() {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .ilike('category', `%${slug}%`)
        .eq('status', 'published')
        .order('published_at', { ascending: false })

      const dbArticles = data || []
      const lowerSlug = (slug || '').toLowerCase()
      const matchingCurated = CURATED_FASHION_ARTICLES.filter((a) => {
        const cat = a.category.toLowerCase()
        if (lowerSlug === 'fashion') return cat === 'fashion'
        if (lowerSlug === 'style') return cat === 'style'
        if (lowerSlug === 'lifestyle') return cat === 'lifestyle' || cat === 'fashion' || cat === 'style'
        return false
      })

      const seenIds = new Set(dbArticles.map((a) => a.id))
      const combined = [...dbArticles]
      matchingCurated.forEach((a) => {
        if (!seenIds.has(a.id)) {
          combined.push(a)
        }
      })

      setArticles(combined)
    } catch (err) {
      console.error('Failed to fetch category articles:', err)
      const lowerSlug = (slug || '').toLowerCase()
      const matchingCurated = CURATED_FASHION_ARTICLES.filter(
        (a) => a.category.toLowerCase() === lowerSlug || lowerSlug === 'lifestyle'
      )
      if (matchingCurated.length > 0) {
        setArticles(matchingCurated)
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function fetchCategoryName() {
    const lowerSlug = (slug || '').toLowerCase()
    const fallback = FALLBACK_CATEGORY_MAP[lowerSlug]

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name_bn, name_en')
        .eq('slug', lowerSlug)
        .maybeSingle()

      if (error || !data) {
        if (fallback) {
          setCategoryName(lang === 'bn' ? fallback.bn : fallback.en)
        } else {
          setCategoryName(slug)
        }
        return
      }

      setCategoryName(
        lang === 'bn'
          ? data.name_bn || data.name_en
          : data.name_en || data.name_bn
      )
    } catch {
      if (fallback) {
        setCategoryName(lang === 'bn' ? fallback.bn : fallback.en)
      } else {
        setCategoryName(slug)
      }
    }
  }

  const formatDate = (date) => {
    if (!date) return ''
    try {
      return format(new Date(date), 'PP', {
        locale: lang === 'bn' ? bn : undefined,
      })
    } catch {
      return date
    }
  }

  const getLocalizedTitle = (article) => {
    if (lang === 'bn' && article.title_bn) return article.title_bn
    return article.title
  }

  const getLocalizedExcerpt = (article) => {
    if (lang === 'bn' && article.excerpt_bn) return article.excerpt_bn
    return article.excerpt
  }

  if (loading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="container-custom py-8 text-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg max-w-md mx-auto">
          <p className="text-lg font-semibold mb-2">
            {lang === 'bn' ? 'লোড করা যায়নি' : 'Failed to load articles'}
          </p>
          <p className="text-sm mb-4">{error}</p>
          <button
            onClick={fetchCategoryArticles}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            {lang === 'bn' ? 'আবার চেষ্টা করুন' : 'Try Again'}
          </button>
        </div>
      </div>
    )
  }

  const isFashionOrStyle = ['fashion', 'style', 'lifestyle'].includes((slug || '').toLowerCase())

  return (
    <div className="container-custom py-8">
      <div className="mb-8 border-b pb-4 border-gray-200">
        {isFashionOrStyle && (
          <div className="text-xs uppercase tracking-widest text-red-700 font-semibold mb-1">
            {lang === 'bn' ? 'এডিটোরিয়াল স্পেশাল · ফ্যাশন ও স্টাইল' : 'EDITORIAL SPECIAL · FASHION & STYLE'}
          </div>
        )}
        <h1 className={`text-3xl md:text-4xl font-bold font-serif mb-2 ${lang === 'bn' ? 'font-bangla' : ''}`}>
          {categoryName}
        </h1>
        {isFashionOrStyle && (
          <p className="text-gray-600 text-sm max-w-2xl leading-relaxed">
            {slug?.toLowerCase() === 'fashion'
              ? (lang === 'bn' ? 'সমকালীন রানওয়ে, ঐতিহ্যবাহী দেশীয় তাঁতের বুনন ও উৎসবের ফ্যাশন সম্ভার।' : 'Contemporary runways, traditional South Asian weaves, and modern festive couture.')
              : slug?.toLowerCase() === 'style'
              ? (lang === 'bn' ? 'দৈনন্দিন স্টাইল গাইড, ওয়ারড্রোব সাজানোর কৌশল, মিনিমালিস্ট অলংকার ও গ্রুমিং।' : 'Everyday style guidelines, capsule wardrobe essentials, artisanal jewelry and grooming.')
              : (lang === 'bn' ? 'জীবনধারা, সংস্কৃতি, সাজসজ্জা ও সমকালীন রুচির উন্মুক্ত মঞ্চ।' : 'Modern lifestyle, culture, personal aesthetics and trend analysis.')}
          </p>
        )}
      </div>

      {articles.length === 0 ? (
        <p className="text-center text-gray-500 py-12">
          {lang === 'bn' ? 'কোনো আর্টিকেল পাওয়া যায়নি' : 'No articles found'}
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition flex flex-col group"
            >
              <div className="relative h-56 bg-gray-100 overflow-hidden">
                {article.featured_image ? (
                  <Image
                    src={article.featured_image}
                    alt={getLocalizedTitle(article)}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      const parent = e.currentTarget.parentElement
                      if (parent) {
                        const fallbackDiv = document.createElement('div')
                        fallbackDiv.className =
                          'w-full h-full flex items-center justify-center bg-gray-200 text-gray-500'
                        fallbackDiv.innerHTML = '📷'
                        parent.appendChild(fallbackDiv)
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                    <span className="text-sm">No image</span>
                  </div>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <Link href={`/${lang}/article/${article.id}`}>
                  <h2
                    className={`text-xl font-bold mb-2 hover:text-red-600 transition line-clamp-2 ${
                      lang === 'bn' ? 'font-bangla' : ''
                    }`}
                  >
                    {getLocalizedTitle(article)}
                  </h2>
                </Link>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {getLocalizedExcerpt(article)}
                </p>
                <div className="flex justify-between items-center text-sm text-gray-500 mt-auto">
                  <span>{article.author || (lang === 'bn' ? 'স্টাফ' : 'Staff')}</span>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{formatDate(article.published_at)}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}