'use client'

import { useState, useEffect, memo, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Eye, TrendingUp, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { bn } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'

// --------------------------------------------------------------
// 🔧 AdSense readiness – set to true when you want to enable ads
// --------------------------------------------------------------
const ADSENSE_READY = false  // 👈 Change to true when ready
// When ready, also set your AdSense client ID and ad slots below
const ADSENSE_CLIENT = 'ca-pub-XXXXXXXXXXXXXXXX' // replace with your ID
const AD_SLOT_HERO = '1234567890'                // replace with your slot
const AD_SLOT_INFEED = '1234567891'
const AD_SLOT_FOOTER = '1234567892'

// Load AdSense script only when ready
if (typeof window !== 'undefined' && ADSENSE_READY && !document.querySelector('script[src*="adsbygoogle.js"]')) {
  const script = document.createElement('script')
  script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
  script.async = true
  script.crossOrigin = 'anonymous'
  script.setAttribute('data-ad-client', ADSENSE_CLIENT)
  document.head.appendChild(script)
}

// Ad component – renders nothing unless ADSENSE_READY is true
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
// Memoized Article Card
// --------------------------------------------------------------
const ArticleCard = memo(({ article, lang, formatDate, getLocalizedTitle, getLocalizedExcerpt }) => {
  const title = getLocalizedTitle(article)
  const excerpt = getLocalizedExcerpt(article)
  const date = formatDate(article.published_at)

  return (
    <article className="article-card group bg-white rounded-lg shadow-sm hover:shadow-md transition">
      {article.featured_image && (
        <Link href={`/${lang}/article/${article.id}`}>
          <div className="relative h-48 md:h-56 overflow-hidden rounded-t-lg">
            <Image
              src={article.featured_image}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition duration-300"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/600x400?text=No+Image'
              }}
            />
          </div>
        </Link>
      )}
      <div className="p-3 md:p-4">
        <Link href={`/${lang}/category/${article.category?.toLowerCase()}`}>
          <span className="text-red-600 text-xs md:text-sm font-semibold hover:underline">
            {article.category}
          </span>
        </Link>
        <Link href={`/${lang}/article/${article.id}`}>
          <h3 className={`text-base md:text-lg font-bold mt-1 md:mt-2 mb-1 md:mb-2 hover:text-red-600 transition line-clamp-2 ${lang === 'bn' ? 'font-bangla' : ''}`}>
            {title}
          </h3>
        </Link>
        <p className="text-gray-600 text-xs md:text-sm mb-2 md:mb-3 line-clamp-2 hidden xs:block">
          {excerpt}
        </p>
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{article.author || 'Unknown'}</span>
          <span>{date}</span>
        </div>
      </div>
    </article>
  )
})
ArticleCard.displayName = 'ArticleCard'

// --------------------------------------------------------------
// Skeleton Loader
// --------------------------------------------------------------
const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="bg-gray-200 h-48 md:h-56 rounded-t-lg"></div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="flex justify-between">
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  </div>
)

// --------------------------------------------------------------
// Main Component
// --------------------------------------------------------------
export default function Home({ params: { lang } }) {
  const [featuredArticles, setFeaturedArticles] = useState([])
  const [latestArticles, setLatestArticles] = useState([])
  const [trendingArticles, setTrendingArticles] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch articles with simple cache (5 minutes)
  useEffect(() => {
    const cacheKey = `home_articles_${lang}`
    const cached = sessionStorage.getItem(cacheKey)
    const cacheTime = sessionStorage.getItem(`${cacheKey}_time`)
    const now = Date.now()

    if (cached && cacheTime && now - parseInt(cacheTime) < 5 * 60 * 1000) {
      const data = JSON.parse(cached)
      setFeaturedArticles(data.featured)
      setLatestArticles(data.latest)
      setTrendingArticles(data.trending)
      setLoading(false)
      return
    }

    fetchArticles()
  }, [lang])

  async function fetchArticles() {
    setLoading(true)
    try {
      const [featuredRes, latestRes, trendingRes] = await Promise.all([
        supabase.from('articles').select('*').eq('status', 'published').eq('is_featured', true).order('views', { ascending: false }).limit(3),
        supabase.from('articles').select('*').eq('status', 'published').order('published_at', { ascending: false }).limit(6),
        supabase.from('articles').select('*').eq('status', 'published').order('views', { ascending: false }).limit(5)
      ])

      const featured = featuredRes.data || []
      const latest = latestRes.data || []
      const trending = trendingRes.data || []

      setFeaturedArticles(featured)
      setLatestArticles(latest)
      setTrendingArticles(trending)

      // Cache results
      sessionStorage.setItem(`home_articles_${lang}`, JSON.stringify({ featured, latest, trending }))
      sessionStorage.setItem(`home_articles_${lang}_time`, Date.now().toString())
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = useCallback((date) => {
    if (!date) return ''
    try {
      return format(new Date(date), 'PP', {
        locale: lang === 'bn' ? bn : undefined
      })
    } catch {
      return date
    }
  }, [lang])

  const getLocalizedTitle = useCallback((article) => {
    if (lang === 'bn' && article.title_bn) return article.title_bn
    return article.title
  }, [lang])

  const getLocalizedExcerpt = useCallback((article) => {
    if (lang === 'bn' && article.excerpt_bn) return article.excerpt_bn
    return article.excerpt
  }, [lang])

  // Structured data (JSON-LD) – always good for SEO
  useEffect(() => {
    if (typeof window === 'undefined') return
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": lang === 'bn' ? "দৈনিক অভিমত - হোম" : "Doinik Ovimot - Home",
      "description": lang === 'bn' ? "সর্বশেষ সংবাদ, বিশ্লেষণ এবং ট্রেন্ডিং খবর" : "Latest news, analysis and trending stories",
      "url": typeof window !== 'undefined' ? window.location.href : '',
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": latestArticles.slice(0, 5).map((article, idx) => ({
          "@type": "ListItem",
          "position": idx + 1,
          "url": `/${lang}/article/${article.id}`
        }))
      }
    })
    document.head.appendChild(script)
    return () => {
      document.head.removeChild(script)
    }
  }, [lang, latestArticles])

  if (loading) return <LoadingSpinner />

  return (
    <div className="pb-16 md:pb-0">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-700 text-white py-8 md:py-16">
        <div className="container-custom">
          <h1 className="heading-1 text-center mb-6 md:mb-8">
            {lang === 'bn' ? 'সর্বশেষ সংবাদ ও বিশ্লেষণ' : 'Latest News & Analysis'}
          </h1>

          {featuredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {featuredArticles.map((article, index) => (
                <Link href={`/${lang}/article/${article.id}`} key={article.id}>
                  <div className={`bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden hover:bg-white/20 transition ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                    }`}>
                    {article.featured_image && (
                      <div className={`relative ${index === 0 ? 'h-56 md:h-64' : 'h-40 md:h-48'}`}>
                        <Image
                          src={article.featured_image}
                          alt={getLocalizedTitle(article)}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover hover:scale-105 transition duration-300"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/600x400?text=No+Image'
                          }}
                        />
                      </div>
                    )}
                    <div className="p-3 md:p-4">
                      <span className="text-red-400 text-xs md:text-sm font-semibold">{article.category}</span>
                      <h2 className={`text-base md:text-xl font-bold mt-1 md:mt-2 mb-1 md:mb-2 line-clamp-2 ${lang === 'bn' ? 'font-bangla' : ''}`}>
                        {getLocalizedTitle(article)}
                      </h2>
                      <p className="text-gray-300 text-xs md:text-sm line-clamp-2 hidden sm:block">
                        {getLocalizedExcerpt(article)}
                      </p>
                      <div className="flex items-center gap-3 md:gap-4 mt-2 md:mt-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="md:w-4 md:h-4" />
                          {formatDate(article.published_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye size={12} className="md:w-4 md:h-4" />
                          {article.views || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">{lang === 'bn' ? 'কোনো ফিচার্ড আর্টিকেল নেই' : 'No featured articles'}</p>
            </div>
          )}
        </div>
      </section>

      {/* 👇 Ad slot below hero (disabled until ADSENSE_READY = true) */}
      <AdSlot slot={AD_SLOT_HERO} style={{ minHeight: '90px' }} />

      {/* Latest News Section */}
      <section className="container-custom py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8">
          <h2 className="heading-2 border-l-4 border-red-600 pl-3 md:pl-4">
            {lang === 'bn' ? 'সর্বশেষ সংবাদ' : 'Latest News'}
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-2 md:mt-0">
            <Clock size={14} />
            <span>{lang === 'bn' ? 'সর্বশেষ আপডেট' : 'Latest updates'}</span>
          </div>
        </div>

        {latestArticles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {latestArticles.map((article, idx) => (
              <div key={article.id}>
                <ArticleCard
                  article={article}
                  lang={lang}
                  formatDate={formatDate}
                  getLocalizedTitle={getLocalizedTitle}
                  getLocalizedExcerpt={getLocalizedExcerpt}
                />
                {/* 👇 In-feed ad after 3rd article (desktop) and 2nd (mobile) – ready for when you enable */}
                {idx === 2 && (
                  <div className="hidden sm:block my-6">
                    <AdSlot slot={AD_SLOT_INFEED} format="rectangle" style={{ minHeight: '250px' }} />
                  </div>
                )}
                {idx === 1 && (
                  <div className="block sm:hidden my-4">
                    <AdSlot slot={AD_SLOT_INFEED} format="rectangle" style={{ minHeight: '250px' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">{lang === 'bn' ? 'কোনো আর্টিকেল পাওয়া যায়নি' : 'No articles found'}</p>
            <Link href={`/${lang}/admin/new-article`} className="inline-block mt-4 text-red-600 hover:text-red-700">
              {lang === 'bn' ? 'প্রথম আর্টিকেল তৈরি করুন' : 'Create first article'}
            </Link>
          </div>
        )}
      </section>

      {/* Trending Section */}
      {trendingArticles.length > 0 && (
        <section className="bg-gray-50 py-8 md:py-12">
          <div className="container-custom">
            <h2 className="heading-2 flex items-center gap-2 mb-6 md:mb-8">
              <TrendingUp className="text-red-600" size={24} />
              {lang === 'bn' ? 'ট্রেন্ডিং সংবাদ' : 'Trending News'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {trendingArticles.map((article, index) => (
                <Link href={`/${lang}/article/${article.id}`} key={article.id}>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg hover:shadow-md transition">
                    <div className="text-2xl md:text-3xl font-bold text-red-600 min-w-[40px]">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold text-sm md:text-base hover:text-red-600 transition line-clamp-2 ${lang === 'bn' ? 'font-bangla' : ''}`}>
                        {getLocalizedTitle(article)}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <Eye size={12} />
                        <span>{article.views || 0} {lang === 'bn' ? 'দর্শন' : 'views'}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 👇 Footer ad slot (disabled until ready) */}
      <AdSlot slot={AD_SLOT_FOOTER} format="horizontal" style={{ minHeight: '90px' }} />
    </div>
  )
}