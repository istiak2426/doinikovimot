'use client'

import { useState, useEffect, memo, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, RefreshCw, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { bn } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'

// --------------------------------------------------------------
// AdSense
// --------------------------------------------------------------
const ADSENSE_READY = false
const ADSENSE_CLIENT = 'ca-pub-XXXXXXXXXXXXXXXX'

const loadAds = () => {
  try {
    if (typeof window !== 'undefined' && window.adsbygoogle) {
      (window.adsbygoogle = window.adsbygoogle || []).push({})
    }
  } catch (e) {}
}

const AdSlot = ({ slot, style = {} }) => {
  if (!ADSENSE_READY) return null

  useEffect(() => {
    loadAds()
  }, [])

  return (
    <div className="my-6 text-center">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}

// --------------------------------------------------------------
// Helpers
// --------------------------------------------------------------
const formatBanglaDate = (date, lang) => {
  if (!date) return ''
  const d = new Date(date)
  return lang === 'bn'
    ? d.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })
    : format(d, 'PP')
}

// --------------------------------------------------------------
// Cards
// --------------------------------------------------------------
const CompactArticleCard = memo(({ article, lang, getLocalizedTitle }) => {
  if (!article) return null

  return (
    <Link href={`/${lang}/article/${article.id}`}>
      <div className="flex gap-3 border-b border-gray-100 py-3 hover:bg-gray-50 transition cursor-pointer">
        {article.featured_image && (
          <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
            <Image
              src={article.featured_image}
              alt={getLocalizedTitle(article)}
              fill
              className="object-cover"
              onError={(e) => (e.target.src = '/fallback.jpg')}
            />
          </div>
        )}

        <div className="flex-1">
          <h3 className={`font-semibold text-sm line-clamp-2 hover:text-red-600 ${lang === 'bn' ? 'font-bangla' : ''}`}>
            {getLocalizedTitle(article)}
          </h3>

          <div className="text-xs text-gray-400 mt-1">
            {article.published_at
              ? formatBanglaDate(article.published_at, lang)
              : 'No date'}
          </div>
        </div>
      </div>
    </Link>
  )
})
CompactArticleCard.displayName = 'CompactArticleCard'

const MainArticleCard = memo(({ article, lang, getLocalizedTitle, getLocalizedExcerpt, formatDate, size = 'large' }) => {
  if (!article) return null

  return (
    <Link href={`/${lang}/article/${article.id}`}>
      <div className="group cursor-pointer">
        {article.featured_image && (
          <div className={`relative overflow-hidden rounded bg-gray-100 ${size === 'large' ? 'h-80' : 'h-48'}`}>
            <Image
              src={article.featured_image}
              alt={getLocalizedTitle(article)}
              fill
              className="object-cover group-hover:scale-105 transition"
            />
          </div>
        )}

        <div className="mt-3">
          <span className="text-red-600 text-xs font-bold">{article.category}</span>

          <h2 className={`font-bold mt-1 line-clamp-2 hover:text-red-600 ${size === 'large' ? 'text-xl' : 'text-lg'}`}>
            {getLocalizedTitle(article)}
          </h2>

          {size === 'large' && (
            <p className="text-gray-600 text-sm mt-2 line-clamp-2">
              {getLocalizedExcerpt(article)}
            </p>
          )}

          <div className="text-xs text-gray-400 mt-2 flex gap-3">
            <span>{formatDate(article.published_at)}</span>
            <span className="flex items-center gap-1">
              <Eye size={12} /> {article.views || 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
})
MainArticleCard.displayName = 'MainArticleCard'

// --------------------------------------------------------------
// Header
// --------------------------------------------------------------
const SectionHeader = ({ title, seeAllLink, lang }) => (
  <div className="flex justify-between items-center border-b-2 border-red-600 pb-2 mb-4">
    <h2 className="text-xl font-bold">{title}</h2>

    {seeAllLink && (
      <Link href={seeAllLink} className="text-red-600 text-sm flex items-center gap-1">
        {lang === 'bn' ? 'সব দেখুন' : 'See all'} <ChevronRight size={16} />
      </Link>
    )}
  </div>
)

// --------------------------------------------------------------
// Main
// --------------------------------------------------------------
export default function Home({ params: { lang } }) {
  const [featuredArticles, setFeaturedArticles] = useState([])
  const [latestArticles, setLatestArticles] = useState([])
  const [trendingArticles, setTrendingArticles] = useState([])
  const [categoryArticles, setCategoryArticles] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // 🔥 Parallel fetch (FAST)
      const [featuredRes, latestRes, trendingRes] = await Promise.all([
        supabase.from('articles').select('*').eq('status', 'published').eq('is_featured', true).limit(4),
        supabase.from('articles').select('*').eq('status', 'published').order('published_at', { ascending: false }).limit(8),
        supabase.from('articles').select('*').eq('status', 'published').order('views', { ascending: false }).limit(6),
      ])

      if (featuredRes.error || latestRes.error || trendingRes.error) throw new Error('Fetch failed')

      setFeaturedArticles(featuredRes.data || [])
      setLatestArticles(latestRes.data || [])
      setTrendingArticles(trendingRes.data || [])

      // categories
      const cats = ['Politics', 'Business', 'Sports', 'Entertainment', 'International']
      const catData = {}

      await Promise.all(
        cats.map(async (cat) => {
          const { data } = await supabase
            .from('articles')
            .select('*')
            .eq('category', cat)
            .limit(4)

          catData[cat] = data || []
        })
      )

      setCategoryArticles(catData)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  const formatDate = (date) => {
    if (!date) return ''
    return format(new Date(date), 'PP', { locale: lang === 'bn' ? bn : undefined })
  }

  const getLocalizedTitle = (a) => (lang === 'bn' && a.title_bn ? a.title_bn : a.title)
  const getLocalizedExcerpt = (a) => (lang === 'bn' && a.excerpt_bn ? a.excerpt_bn : a.excerpt)

  if (loading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="text-center py-10">
        <p>{error}</p>
        <button onClick={fetchArticles} className="bg-red-600 text-white px-4 py-2 mt-4">
          Retry
        </button>
      </div>
    )
  }

  const hero = featuredArticles[0]

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {hero && (
          <MainArticleCard
            article={hero}
            lang={lang}
            getLocalizedTitle={getLocalizedTitle}
            getLocalizedExcerpt={getLocalizedExcerpt}
            formatDate={formatDate}
          />
        )}
      </div>

      <AdSlot slot="1234567890" />

      <div className="container mx-auto px-4 py-6 grid md:grid-cols-2 gap-6">
        {latestArticles.map((a) => (
          <MainArticleCard
            key={a.id}
            article={a}
            lang={lang}
            getLocalizedTitle={getLocalizedTitle}
            getLocalizedExcerpt={getLocalizedExcerpt}
            formatDate={formatDate}
            size="small"
          />
        ))}
      </div>
    </div>
  )
}