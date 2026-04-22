'use client'

import { useState, useEffect, memo, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, RefreshCw, ChevronRight, TrendingUp, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { bn } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'

// --------------------------------------------------------------
// AdSense (optional)
// --------------------------------------------------------------
const ADSENSE_READY = false
const ADSENSE_CLIENT = 'ca-pub-XXXXXXXXXXXXXXXX'

const loadAds = () => {
  try {
    if (typeof window !== 'undefined' && window.adsbygoogle) {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    }
  } catch (e) {}
}

const AdSlot = ({ slot, style = {} }) => {
  useEffect(() => {
    if (ADSENSE_READY) loadAds()
  }, [])
  if (!ADSENSE_READY) return null
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
const formatDateLocalized = (date, lang) => {
  if (!date) return ''
  const d = new Date(date)
  if (lang === 'bn') {
    return d.toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  return format(d, 'PP', { locale: bn }) // fallback to English format
}

// --------------------------------------------------------------
// Loading Skeleton Components
// --------------------------------------------------------------
const HeroSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-80 bg-gray-200 rounded-lg"></div>
    <div className="mt-3 space-y-2">
      <div className="h-4 bg-gray-200 w-1/4 rounded"></div>
      <div className="h-6 bg-gray-200 w-3/4 rounded"></div>
      <div className="h-4 bg-gray-200 w-full rounded"></div>
    </div>
  </div>
)

const ArticleCardSkeleton = () => (
  <div className="animate-pulse flex gap-3">
    <div className="w-20 h-20 bg-gray-200 rounded"></div>
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 w-3/4 rounded"></div>
      <div className="h-3 bg-gray-200 w-1/2 rounded"></div>
    </div>
  </div>
)

const CategorySectionSkeleton = () => (
  <div className="space-y-4">
    <div className="h-6 bg-gray-200 w-1/3 rounded"></div>
    <div className="grid grid-cols-1 gap-4">
      {[1, 2, 3].map((i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </div>
  </div>
)

// --------------------------------------------------------------
// Article Card Components
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
          <h3
            className={`font-semibold text-sm line-clamp-2 hover:text-red-600 ${
              lang === 'bn' ? 'font-bangla' : ''
            }`}
          >
            {getLocalizedTitle(article)}
          </h3>
          <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
            <Clock size={12} />
            {article.published_at
              ? formatDateLocalized(article.published_at, lang)
              : 'No date'}
          </div>
        </div>
      </div>
    </Link>
  )
})
CompactArticleCard.displayName = 'CompactArticleCard'

const MainArticleCard = memo(
  ({
    article,
    lang,
    getLocalizedTitle,
    getLocalizedExcerpt,
    formatDate,
    size = 'large',
  }) => {
    if (!article) return null
    const isLarge = size === 'large'
    return (
      <Link href={`/${lang}/article/${article.id}`}>
        <div className="group cursor-pointer">
          {article.featured_image && (
            <div
              className={`relative overflow-hidden rounded bg-gray-100 ${
                isLarge ? 'h-80 md:h-96' : 'h-48'
              }`}
            >
              <Image
                src={article.featured_image}
                alt={getLocalizedTitle(article)}
                fill
                className="object-cover group-hover:scale-105 transition duration-300"
                priority={isLarge}
              />
            </div>
          )}
          <div className="mt-3">
            {article.category && (
              <span className="text-red-600 text-xs font-bold uppercase tracking-wide">
                {article.category}
              </span>
            )}
            <h2
              className={`font-bold mt-1 line-clamp-2 group-hover:text-red-600 ${
                isLarge ? 'text-2xl md:text-3xl' : 'text-lg'
              }`}
            >
              {getLocalizedTitle(article)}
            </h2>
            {isLarge && (
              <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                {getLocalizedExcerpt(article)}
              </p>
            )}
            <div className="text-xs text-gray-400 mt-2 flex gap-3">
              <span>{formatDate(article.published_at)}</span>
              <span className="flex items-center gap-1">
                <Eye size={12} /> {article.views?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        </div>
      </Link>
    )
  }
)
MainArticleCard.displayName = 'MainArticleCard'

const SectionHeader = ({ title, seeAllLink, lang }) => (
  <div className="flex justify-between items-center border-b-2 border-red-600 pb-2 mb-4">
    <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
    {seeAllLink && (
      <Link
        href={seeAllLink}
        className="text-red-600 text-sm flex items-center gap-1 hover:underline"
      >
        {lang === 'bn' ? 'সব দেখুন' : 'See all'} <ChevronRight size={16} />
      </Link>
    )}
  </div>
)

// --------------------------------------------------------------
// Main Home Component
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
      // Parallel fetch for main sections
      const [featuredRes, latestRes, trendingRes] = await Promise.all([
        supabase
          .from('articles')
          .select('*')
          .eq('status', 'published')
          .eq('is_featured', true)
          .limit(4),
        supabase
          .from('articles')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(12),
        supabase
          .from('articles')
          .select('*')
          .eq('status', 'published')
          .order('views', { ascending: false })
          .limit(6),
      ])

      if (featuredRes.error || latestRes.error || trendingRes.error)
        throw new Error('Failed to fetch articles')

      setFeaturedArticles(featuredRes.data || [])
      setLatestArticles(latestRes.data || [])
      setTrendingArticles(trendingRes.data || [])

      // Fetch category-specific articles (only categories with data)
      const categories = ['Politics', 'Business', 'Sports', 'Entertainment', 'Technology']
      const catData = {}

      await Promise.all(
        categories.map(async (cat) => {
          const { data, error } = await supabase
            .from('articles')
            .select('*')
            .eq('status', 'published')
            .eq('category', cat)
            .order('published_at', { ascending: false })
            .limit(4)
          if (!error && data?.length) catData[cat] = data
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

  const getLocalizedTitle = (a) =>
    lang === 'bn' && a.title_bn ? a.title_bn : a.title
  const getLocalizedExcerpt = (a) =>
    lang === 'bn' && a.excerpt_bn ? a.excerpt_bn : a.excerpt

  const heroArticle = featuredArticles[0]
  const subHeroArticles = featuredArticles.slice(1, 4)

  // Loading state with skeletons
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <HeroSkeleton />
            </div>
            <div className="hidden lg:block space-y-4">
              <div className="h-6 bg-gray-200 w-1/3 rounded"></div>
              {[1, 2, 3].map((i) => (
                <ArticleCardSkeleton key={i} />
              ))}
            </div>
          </div>
          <div className="mt-12">
            <div className="h-6 bg-gray-200 w-1/4 rounded mb-4"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-48 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 w-3/4 rounded"></div>
                  <div className="h-3 bg-gray-200 w-1/2 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchArticles}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Hero Section: Featured + Trending Sidebar */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Main Featured Article */}
          <div className="lg:col-span-2">
            {heroArticle && (
              <MainArticleCard
                article={heroArticle}
                lang={lang}
                getLocalizedTitle={getLocalizedTitle}
                getLocalizedExcerpt={getLocalizedExcerpt}
                formatDate={formatDate}
                size="large"
              />
            )}
            {/* Sub-featured (grid of 3) */}
            {subHeroArticles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
                {subHeroArticles.map((article) => (
                  <MainArticleCard
                    key={article.id}
                    article={article}
                    lang={lang}
                    getLocalizedTitle={getLocalizedTitle}
                    getLocalizedExcerpt={getLocalizedExcerpt}
                    formatDate={formatDate}
                    size="small"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: Trending Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 border-b pb-2 mb-3">
                <TrendingUp size={18} className="text-red-600" />
                <h3 className="font-bold text-lg">
                  {lang === 'bn' ? 'ট্রেন্ডিং' : 'Trending'}
                </h3>
              </div>
              {trendingArticles.length > 0 ? (
                <div className="space-y-1">
                  {trendingArticles.map((article, idx) => (
                    <Link
                      key={article.id}
                      href={`/${lang}/article/${article.id}`}
                      className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded-lg transition"
                    >
                      <span className="font-bold text-red-500 text-lg min-w-[28px]">
                        {idx + 1}
                      </span>
                      <p className="text-sm font-medium line-clamp-2">
                        {getLocalizedTitle(article)}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">
                  {lang === 'bn' ? 'কোন ট্রেন্ডিং আর্টিকেল নেই' : 'No trending articles'}
                </p>
              )}
            </div>

            {/* Optional Ad Slot in Sidebar */}
            <AdSlot slot="0987654321" style={{ minHeight: '250px' }} />
          </div>
        </div>

        {/* Latest News Section */}
        <div className="mt-12">
          <SectionHeader
            title={lang === 'bn' ? 'সর্বশেষ সংবাদ' : 'Latest News'}
            seeAllLink={`/${lang}/latest`}
            lang={lang}
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestArticles.slice(0, 9).map((article) => (
              <MainArticleCard
                key={article.id}
                article={article}
                lang={lang}
                getLocalizedTitle={getLocalizedTitle}
                getLocalizedExcerpt={getLocalizedExcerpt}
                formatDate={formatDate}
                size="small"
              />
            ))}
          </div>
        </div>

        {/* Category Sections (dynamic) */}
        {Object.keys(categoryArticles).length > 0 && (
          <div className="mt-12 space-y-12">
            {Object.entries(categoryArticles).map(([category, articles]) => (
              <div key={category}>
                <SectionHeader
                  title={category}
                  seeAllLink={`/${lang}/category/${category.toLowerCase()}`}
                  lang={lang}
                />
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {articles.slice(0, 4).map((article) => (
                    <CompactArticleCard
                      key={article.id}
                      article={article}
                      lang={lang}
                      getLocalizedTitle={getLocalizedTitle}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* In-feed Ad (optional) */}
        <AdSlot slot="1122334455" />
      </div>
    </div>
  )
}
