'use client'

import { useState, useEffect, memo, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, RefreshCw, ChevronRight, Clock, TrendingUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
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
const getRelativeTime = (date, lang) => {
  if (!date) return ''
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    const locale = lang === 'bn' ? bn : undefined
    // For Bengali, customize suffix to match typical news style
    if (lang === 'bn') {
      const result = formatDistanceToNow(d, { addSuffix: true, locale: bn })
      // Replace "প্রায়" if needed, but keep as is
      return result
    }
    return formatDistanceToNow(d, { addSuffix: true, locale: undefined })
  } catch (err) {
    return ''
  }
}

// Map category to Bangla for display
const getCategoryBangla = (category) => {
  const map = {
    Politics: 'রাজনীতি',
    Business: 'বাণিজ্য',
    Sports: 'খেলা',
    Entertainment: 'বিনোদন',
    Technology: 'প্রযুক্তি',
    International: 'আন্তর্জাতিক',
    National: 'জাতীয়',
  }
  return map[category] || category
}

// --------------------------------------------------------------
// Loading Skeleton Components
// --------------------------------------------------------------
const HeroSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-80 bg-gray-200 rounded"></div>
    <div className="mt-3 space-y-2">
      <div className="h-4 bg-gray-200 w-1/4 rounded"></div>
      <div className="h-6 bg-gray-200 w-3/4 rounded"></div>
      <div className="h-4 bg-gray-200 w-full rounded"></div>
    </div>
  </div>
)

const ArticleCardSkeleton = () => (
  <div className="animate-pulse flex gap-3 border-b border-gray-100 pb-3">
    <div className="w-20 h-20 bg-gray-200 rounded"></div>
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 w-3/4 rounded"></div>
      <div className="h-3 bg-gray-200 w-1/2 rounded"></div>
    </div>
  </div>
)

const SidebarSkeleton = () => (
  <div className="bg-white p-4 border border-gray-200">
    <div className="h-6 bg-gray-200 w-1/2 mb-4 rounded"></div>
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="border-b border-gray-100 pb-2">
          <div className="h-4 bg-gray-200 w-full rounded"></div>
          <div className="h-3 bg-gray-200 w-20 mt-2 rounded"></div>
        </div>
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
          {article.category && (
            <span className="text-red-700 text-xs font-semibold uppercase tracking-wide">
              {lang === 'bn' ? getCategoryBangla(article.category) : article.category}
            </span>
          )}
          <h3
            className={`font-semibold text-sm line-clamp-2 mt-1 hover:text-red-700 ${
              lang === 'bn' ? 'font-bangla' : ''
            }`}
          >
            {getLocalizedTitle(article)}
          </h3>
          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <Clock size={12} />
            {getRelativeTime(article.published_at, lang)}
          </div>
        </div>
      </div>
    </Link>
  )
})
CompactArticleCard.displayName = 'CompactArticleCard'

const MainArticleCard = memo(
  ({ article, lang, getLocalizedTitle, getLocalizedExcerpt, size = 'large' }) => {
    if (!article) return null
    const isLarge = size === 'large'
    return (
      <Link href={`/${lang}/article/${article.id}`}>
        <div className="group cursor-pointer">
          {article.featured_image && (
            <div
              className={`relative overflow-hidden bg-gray-100 ${
                isLarge ? 'h-80 md:h-96' : 'h-48'
              } rounded`}
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
              <span className="text-red-700 text-xs font-semibold uppercase tracking-wide">
                {lang === 'bn' ? getCategoryBangla(article.category) : article.category}
              </span>
            )}
            <h2
              className={`font-bold mt-1 line-clamp-2 group-hover:text-red-700 ${
                isLarge ? 'text-2xl md:text-3xl font-serif' : 'text-lg'
              }`}
            >
              {getLocalizedTitle(article)}
            </h2>
            {isLarge && (
              <p className="text-gray-700 text-sm mt-2 line-clamp-3">
                {getLocalizedExcerpt(article)}
              </p>
            )}
            <div className="text-xs text-gray-500 mt-2 flex gap-3">
              <span className="flex items-center gap-1">
                <Clock size={12} /> {getRelativeTime(article.published_at, lang)}
              </span>
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
  <div className="flex justify-between items-center border-b-2 border-red-700 pb-2 mb-4">
    <h2 className="text-xl md:text-2xl font-bold font-serif">{title}</h2>
    {seeAllLink && (
      <Link
        href={seeAllLink}
        className="text-red-700 text-sm flex items-center gap-1 hover:underline"
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
  const [categoryArticles, setCategoryArticles] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [featuredRes, latestRes] = await Promise.all([
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
      ])

      if (featuredRes.error || latestRes.error) throw new Error('Failed to fetch articles')

      setFeaturedArticles(featuredRes.data || [])
      setLatestArticles(latestRes.data || [])

      const categories = ['Politics', 'Business', 'Sports', 'Entertainment', 'Technology', 'International']
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

  const getLocalizedTitle = (a) =>
    lang === 'bn' && a.title_bn ? a.title_bn : a.title
  const getLocalizedExcerpt = (a) =>
    lang === 'bn' && a.excerpt_bn ? a.excerpt_bn : a.excerpt

  const heroArticle = featuredArticles[0]
  const subHeroArticles = featuredArticles.slice(1, 4)

  // Sidebar latest (first 6 of latestArticles)
  const sidebarLatest = latestArticles.slice(0, 6)

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 pt-0 pb-6">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <HeroSkeleton />
            </div>
            <div className="hidden lg:block">
              <SidebarSkeleton />
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
        <div className="text-center p-8 bg-white rounded shadow-sm border border-gray-200">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchArticles}
            className="bg-red-700 text-white px-6 py-2 rounded hover:bg-red-800 transition flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* MAIN CONTAINER */}
      <div className="container mx-auto px-4 pt-0 pb-6 max-w-screen-xl">
        {/* Hero + Sidebar (Latest) */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Featured Articles */}
          <div className="lg:col-span-2">
            {heroArticle && (
              <MainArticleCard
                article={heroArticle}
                lang={lang}
                getLocalizedTitle={getLocalizedTitle}
                getLocalizedExcerpt={getLocalizedExcerpt}
                size="large"
              />
            )}
            {subHeroArticles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
                {subHeroArticles.map((article) => (
                  <MainArticleCard
                    key={article.id}
                    article={article}
                    lang={lang}
                    getLocalizedTitle={getLocalizedTitle}
                    getLocalizedExcerpt={getLocalizedExcerpt}
                    size="small"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Latest News Sidebar (Classic "সর্বশেষ" style) */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 p-4">
              <div className="flex items-center gap-2 border-b border-red-700 pb-2 mb-3">
                <Clock size={18} className="text-red-700" />
                <h3 className="font-bold text-lg font-serif">
                  {lang === 'bn' ? 'সর্বশেষ' : 'Latest'}
                </h3>
              </div>
              {sidebarLatest.length > 0 ? (
                <div className="space-y-3">
                  {sidebarLatest.map((article) => (
                    <Link
                      key={article.id}
                      href={`/${lang}/article/${article.id}`}
                      className="block border-b border-gray-100 pb-3 last:border-0 hover:bg-gray-50 transition p-1"
                    >
                      <p className="text-sm font-medium line-clamp-2 hover:text-red-700">
                        {getLocalizedTitle(article)}
                      </p>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Clock size={11} />
                        {getRelativeTime(article.published_at, lang)}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">
                  {lang === 'bn' ? 'কোন সংবাদ নেই' : 'No news'}
                </p>
              )}
            </div>
            <AdSlot slot="0987654321" style={{ minHeight: '250px' }} />
          </div>
        </div>

        {/* Latest News Section (Grid) */}
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
                size="small"
              />
            ))}
          </div>
        </div>

        {/* Category Sections */}
        {Object.keys(categoryArticles).length > 0 && (
          <div className="mt-12 space-y-12">
            {Object.entries(categoryArticles).map(([category, articles]) => (
              <div key={category}>
                <SectionHeader
                  title={lang === 'bn' ? getCategoryBangla(category) : category}
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

        <AdSlot slot="1122334455" />
      </div>
    </div>
  )
}
