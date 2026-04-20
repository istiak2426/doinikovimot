'use client'

import { useState, useEffect, memo, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Eye, TrendingUp, Clock, RefreshCw, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { bn } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'

// --------------------------------------------------------------
// AdSense (safe initialization)
// --------------------------------------------------------------
const ADSENSE_READY = false // set to true when you have real ad codes
const ADSENSE_CLIENT = 'ca-pub-XXXXXXXXXXXXXXXX'
const AD_SLOT_HERO = '1234567890'
const AD_SLOT_INFEED = '1234567891'
const AD_SLOT_FOOTER = '1234567892'

// AdSense script initialization (only once, after mount)
const initAdSense = () => {
  if (typeof window !== 'undefined' && ADSENSE_READY && !document.querySelector('script[src*="adsbygoogle.js"]')) {
    const script = document.createElement('script')
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
    script.async = true
    script.crossOrigin = 'anonymous'
    script.setAttribute('data-ad-client', ADSENSE_CLIENT)
    document.head.appendChild(script)
  }
}

const AdSlot = ({ slot, format = 'auto', style = {} }) => {
  if (!ADSENSE_READY) return null
  return (
    <div className="my-6 text-center">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
      <script dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }} />
    </div>
  )
}

// --------------------------------------------------------------
// Helper: format date consistently (Bengali or English)
// --------------------------------------------------------------
const formatBanglaDate = (date, lang) => {
  if (!date) return ''
  const d = new Date(date)
  if (lang === 'bn') {
    return d.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })
  }
  return format(d, 'PP')
}

// --------------------------------------------------------------
// Article Card (compact for sidebars)
// --------------------------------------------------------------
const CompactArticleCard = memo(({ article, lang, getLocalizedTitle }) => {
  if (!article) return null
  return (
    <Link href={`/${lang}/article/${article.id}`}>
      <div className="flex gap-3 border-b border-gray-100 py-3 hover:bg-gray-50 transition cursor-pointer">
        {article.featured_image && (
          <div className="relative w-20 h-20 flex-shrink-0">
            <Image
              src={article.featured_image}
              alt={getLocalizedTitle(article)}
              fill
              className="object-cover rounded"
            />
          </div>
        )}
        <div className="flex-1">
          <h3 className={`font-semibold text-sm hover:text-red-600 transition line-clamp-2 ${lang === 'bn' ? 'font-bangla' : ''}`}>
            {getLocalizedTitle(article)}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
            <span>{article.author || (lang === 'bn' ? 'স্টাফ' : 'Staff')}</span>
            <span>•</span>
            <span>{article.published_at ? formatBanglaDate(article.published_at, lang) : (lang === 'bn' ? 'তারিখ নেই' : 'No date')}</span>
          </div>
        </div>
      </div>
    </Link>
  )
})
CompactArticleCard.displayName = 'CompactArticleCard'

// --------------------------------------------------------------
// Main Article Card (for hero and featured)
// --------------------------------------------------------------
const MainArticleCard = memo(({ article, lang, getLocalizedTitle, getLocalizedExcerpt, formatDate, size = 'large', priority = false }) => {
  if (!article) return null
  return (
    <Link href={`/${lang}/article/${article.id}`}>
      <div className="group cursor-pointer">
        {article.featured_image && (
          <div className={`relative overflow-hidden rounded-md ${size === 'large' ? 'h-64 md:h-80' : 'h-48'}`}>
            <Image
              src={article.featured_image}
              alt={getLocalizedTitle(article)}
              fill
              className="object-cover group-hover:scale-105 transition duration-500"
              priority={priority}
            />
          </div>
        )}
        <div className="mt-3">
          <span className="text-red-600 text-xs uppercase font-bold tracking-wide">{article.category}</span>
          <h2 className={`font-bold mt-1 hover:text-red-600 transition line-clamp-2 ${size === 'large' ? 'text-xl md:text-2xl' : 'text-lg'} ${lang === 'bn' ? 'font-bangla' : ''}`}>
            {getLocalizedTitle(article)}
          </h2>
          {size === 'large' && (
            <p className="text-gray-600 text-sm mt-2 line-clamp-2">{getLocalizedExcerpt(article)}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
            <span>{formatDate(article.published_at)}</span>
            <span className="flex items-center gap-1"><Eye size={12} /> {article.views || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  )
})
MainArticleCard.displayName = 'MainArticleCard'

// --------------------------------------------------------------
// Section Header (with "more" link)
// --------------------------------------------------------------
const SectionHeader = ({ title, seeAllLink, lang }) => (
  <div className="flex justify-between items-center border-b-2 border-red-600 pb-2 mb-4">
    <h2 className="text-xl md:text-2xl font-bold text-gray-800">{title}</h2>
    {seeAllLink && (
      <Link href={seeAllLink} className="text-red-600 text-sm hover:underline flex items-center gap-1">
        {lang === 'bn' ? 'সব দেখুন' : 'See all'} <ChevronRight size={16} />
      </Link>
    )}
  </div>
)

// --------------------------------------------------------------
// Main Component
// --------------------------------------------------------------
export default function Home({ params: { lang } }) {
  const [featuredArticles, setFeaturedArticles] = useState([])
  const [latestArticles, setLatestArticles] = useState([])
  const [trendingArticles, setTrendingArticles] = useState([])
  const [categoryArticles, setCategoryArticles] = useState({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [currentDate, setCurrentDate] = useState('')

  // Hydration-safe current date
  useEffect(() => {
    setCurrentDate(formatBanglaDate(new Date(), lang))
  }, [lang])

  // Initialize AdSense after mount
  useEffect(() => {
    initAdSense()
  }, [])

  const fetchArticles = useCallback(async (bypassCache = false) => {
    if (!bypassCache) {
      setLoading(true)
    } else {
      setRefreshing(true)
    }
    setError(null)

    const cacheKey = `home_articles_prothom_${lang}`
    if (!bypassCache) {
      const cached = sessionStorage.getItem(cacheKey)
      const cacheTime = sessionStorage.getItem(`${cacheKey}_time`)
      if (cached && cacheTime && Date.now() - parseInt(cacheTime) < 5 * 60 * 1000) {
        try {
          const data = JSON.parse(cached)
          setFeaturedArticles(data.featured)
          setLatestArticles(data.latest)
          setTrendingArticles(data.trending)
          setCategoryArticles(data.categoryArticles)
          setLoading(false)
          setRefreshing(false)
          return
        } catch (e) {}
      }
    }

    try {
      // Fetch main featured (is_featured = true)
      const { data: featured, error: fErr } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .eq('is_featured', true)
        .order('views', { ascending: false })
        .limit(4)

      if (fErr) throw fErr

      // Latest 8 articles
      const { data: latest, error: lErr } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(8)

      if (lErr) throw lErr

      // Trending (most viewed) 6
      const { data: trending, error: tErr } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('views', { ascending: false })
        .limit(6)

      if (tErr) throw tErr

      // Category specific: only those we actually display
      const categoriesToFetch = ['Politics', 'Business', 'Sports', 'Entertainment', 'International']
      const categoryData = {}
      for (const cat of categoriesToFetch) {
        const { data } = await supabase
          .from('articles')
          .select('*')
          .eq('status', 'published')
          .eq('category', cat)
          .order('published_at', { ascending: false })
          .limit(4)
        categoryData[cat] = data || []
      }

      setFeaturedArticles(featured || [])
      setLatestArticles(latest || [])
      setTrendingArticles(trending || [])
      setCategoryArticles(categoryData)

      sessionStorage.setItem(cacheKey, JSON.stringify({
        featured: featured || [],
        latest: latest || [],
        trending: trending || [],
        categoryArticles: categoryData
      }))
      sessionStorage.setItem(`${cacheKey}_time`, Date.now().toString())
    } catch (err) {
      console.error('Fetch error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [lang])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  const formatDate = useCallback((date) => {
    if (!date) return ''
    try {
      return format(new Date(date), 'PP', { locale: lang === 'bn' ? bn : undefined })
    } catch { return date }
  }, [lang])

  const getLocalizedTitle = useCallback((article) => {
    if (!article) return ''
    if (lang === 'bn' && article.title_bn) return article.title_bn
    return article.title
  }, [lang])

  const getLocalizedExcerpt = useCallback((article) => {
    if (!article) return ''
    if (lang === 'bn' && article.excerpt_bn) return article.excerpt_bn
    return article.excerpt
  }, [lang])

  // Category name localization mapping
  const getLocalizedCategoryName = (cat) => {
    const names = {
      Politics: lang === 'bn' ? 'রাজনীতি' : 'Politics',
      Business: lang === 'bn' ? 'বাণিজ্য' : 'Business',
      Sports: lang === 'bn' ? 'খেলাধুলা' : 'Sports',
      Entertainment: lang === 'bn' ? 'বিনোদন' : 'Entertainment',
      International: lang === 'bn' ? 'আন্তর্জাতিক' : 'International',
    }
    return names[cat] || cat
  }

  // Error UI
  if (error && !loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="bg-red-50 text-red-600 p-6 rounded-lg max-w-md mx-auto">
            <p className="text-lg font-semibold mb-2">
              {lang === 'bn' ? 'খবর লোড করতে ব্যর্থ হয়েছে' : 'Failed to load news'}
            </p>
            <p className="text-sm mb-4">{error}</p>
            <button
              onClick={() => fetchArticles(true)}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={16} />
              {lang === 'bn' ? 'আবার চেষ্টা করুন' : 'Try again'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) return <LoadingSpinner />

  // Hero article (first featured)
  const heroArticle = featuredArticles[0]
  const subHeroArticles = featuredArticles.slice(1, 3)

  return (
    <div className="bg-gray-50 font-serif">
      {/* Top Bar with Date */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-2 text-sm text-gray-500 flex justify-between items-center">
          <span>{currentDate}</span>
          <button
            onClick={() => fetchArticles(true)}
            disabled={refreshing}
            className="text-red-600 hover:text-red-700 flex items-center gap-1 disabled:opacity-50"
          >
            {refreshing ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            {lang === 'bn' ? 'রিফ্রেশ' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Logo / Header */}


      {/* Hero Section: Prothom Alo style - large left + two right */}
      {heroArticle && (
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main hero */}
            <div className="md:col-span-2">
              <MainArticleCard
                article={heroArticle}
                lang={lang}
                getLocalizedTitle={getLocalizedTitle}
                getLocalizedExcerpt={getLocalizedExcerpt}
                formatDate={formatDate}
                size="large"
                priority={true}
              />
            </div>
            {/* Right side: two sub-hero articles */}
            <div className="space-y-6">
              {subHeroArticles.map(article => (
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
        </div>
      )}

      <AdSlot slot={AD_SLOT_HERO} style={{ minHeight: '90px' }} />

      {/* Latest News + Trending Sidebar (two columns) */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Latest News Grid */}
          <div className="lg:col-span-2">
            <SectionHeader title={lang === 'bn' ? 'সর্বশেষ খবর' : 'Latest News'} seeAllLink={`/${lang}/category/all`} lang={lang} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {latestArticles.slice(0, 6).map(article => (
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
            {/* Infeed ad */}
            <div className="my-8">
              <AdSlot slot={AD_SLOT_INFEED} format="rectangle" style={{ minHeight: '250px' }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {latestArticles.slice(6, 8).map(article => (
                <MainArticleCard key={article.id} article={article} lang={lang} getLocalizedTitle={getLocalizedTitle} getLocalizedExcerpt={getLocalizedExcerpt} formatDate={formatDate} size="small" />
              ))}
            </div>
          </div>

          {/* Right: Trending + Popular */}
          <div>
            <SectionHeader title={lang === 'bn' ? 'সর্বাধিক পঠিত' : 'Most Read'} lang={lang} />
            <div className="space-y-1">
              {trendingArticles.map((article, idx) => (
                <div key={article.id} className="flex items-start gap-3 p-2 border-b border-gray-100">
                  <div className="text-2xl font-bold text-red-500 w-10">{idx + 1}</div>
                  <div className="flex-1">
                    <Link href={`/${lang}/article/${article.id}`}>
                      <h3 className={`font-semibold text-sm hover:text-red-600 transition line-clamp-2 ${lang === 'bn' ? 'font-bangla' : ''}`}>
                        {getLocalizedTitle(article)}
                      </h3>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Category Sections (with localized names and empty fallback) */}
      {['Politics', 'Business', 'Sports', 'Entertainment', 'International'].map(cat => {
        const articles = categoryArticles[cat]
        if (!articles || articles.length === 0) return null
        return (
          <div key={cat} className="container mx-auto px-4 py-6 border-t border-gray-200">
            <SectionHeader title={getLocalizedCategoryName(cat)} seeAllLink={`/${lang}/category/${cat.toLowerCase()}`} lang={lang} />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {articles.slice(0, 4).map(article => (
                <CompactArticleCard key={article.id} article={article} lang={lang} getLocalizedTitle={getLocalizedTitle} />
              ))}
            </div>
          </div>
        )
      })}

      <AdSlot slot={AD_SLOT_FOOTER} format="horizontal" style={{ minHeight: '90px' }} />

      {/* Footer */}

  )
}
