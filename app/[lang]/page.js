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
// AdSense (unchanged)
// --------------------------------------------------------------
const ADSENSE_READY = false
const ADSENSE_CLIENT = 'ca-pub-XXXXXXXXXXXXXXXX'
const AD_SLOT_HERO = '1234567890'
const AD_SLOT_INFEED = '1234567891'
const AD_SLOT_FOOTER = '1234567892'

if (typeof window !== 'undefined' && ADSENSE_READY && !document.querySelector('script[src*="adsbygoogle.js"]')) {
  const script = document.createElement('script')
  script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
  script.async = true
  script.crossOrigin = 'anonymous'
  script.setAttribute('data-ad-client', ADSENSE_CLIENT)
  document.head.appendChild(script)
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
// Helper: format date in Bengali style
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
const CompactArticleCard = memo(({ article, lang, getLocalizedTitle }) => (
  <Link href={`/${lang}/article/${article.id}`}>
    <div className="flex gap-3 border-b border-gray-100 py-3 hover:bg-gray-50 transition">
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
          <span>{article.author || 'স্টাফ'}</span>
          <span>•</span>
          <span>{formatBanglaDate(article.published_at, lang)}</span>
        </div>
      </div>
    </div>
  </Link>
))
CompactArticleCard.displayName = 'CompactArticleCard'

// --------------------------------------------------------------
// Main Article Card (for hero and featured)
// --------------------------------------------------------------
const MainArticleCard = memo(({ article, lang, getLocalizedTitle, getLocalizedExcerpt, formatDate, size = 'large' }) => (
  <Link href={`/${lang}/article/${article.id}`}>
    <div className="group cursor-pointer">
      {article.featured_image && (
        <div className={`relative overflow-hidden rounded-md ${size === 'large' ? 'h-64 md:h-80' : 'h-48'}`}>
          <Image
            src={article.featured_image}
            alt={getLocalizedTitle(article)}
            fill
            className="object-cover group-hover:scale-105 transition duration-500"
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
))
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
  const [error, setError] = useState(null)

  const fetchArticles = useCallback(async (bypassCache = false) => {
    setLoading(true)
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

      // Category specific: National, International, Sports, Entertainment
      const categories = ['Politics', 'Technology', 'Business', 'Sports', 'Entertainment', 'Health', 'International']
      const categoryData = {}
      for (const cat of categories) {
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
    if (lang === 'bn' && article.title_bn) return article.title_bn
    return article.title
  }, [lang])

  const getLocalizedExcerpt = useCallback((article) => {
    if (lang === 'bn' && article.excerpt_bn) return article.excerpt_bn
    return article.excerpt
  }, [lang])

  if (loading) return <LoadingSpinner />

  // Hero article (first featured)
  const heroArticle = featuredArticles[0]
  const subHeroArticles = featuredArticles.slice(1, 3)

  return (
    <div className="bg-gray-50 font-serif">
      {/* Top Bar with Date */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-2 text-sm text-gray-500 flex justify-between items-center">
          <span>{formatBanglaDate(new Date(), lang)}</span>
          <button onClick={() => fetchArticles(true)} className="text-red-600 hover:text-red-700 flex items-center gap-1">
            <RefreshCw size={14} /> {lang === 'bn' ? 'রিফ্রেশ' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Logo / Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-red-700 tracking-tight">
            {lang === 'bn' ? 'দৈনিক অভিমত' : 'Doinik Ovimot'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{lang === 'bn' ? 'সত্যের সন্ধানে' : 'In search of truth'}</p>
        </div>
      </div>

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

      {/* Category Sections (like Prothom Alo's "জাতীয়", "আন্তর্জাতিক", etc.) */}
      {['Politics', 'Business', 'Sports', 'Entertainment', 'International'].map(cat => (
        categoryArticles[cat] && categoryArticles[cat].length > 0 && (
          <div key={cat} className="container mx-auto px-4 py-6 border-t border-gray-200">
            <SectionHeader title={cat} seeAllLink={`/${lang}/category/${cat.toLowerCase()}`} lang={lang} />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {categoryArticles[cat].slice(0, 4).map(article => (
                <CompactArticleCard key={article.id} article={article} lang={lang} getLocalizedTitle={getLocalizedTitle} />
              ))}
            </div>
          </div>
        )
      ))}

      <AdSlot slot={AD_SLOT_FOOTER} format="horizontal" style={{ minHeight: '90px' }} />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Doinik Ovimot. {lang === 'bn' ? 'সর্বস্বত্ব সংরক্ষিত' : 'All rights reserved.'}</p>
        </div>
      </footer>
    </div>
  )
}
