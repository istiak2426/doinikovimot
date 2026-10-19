'use client'

import { useState, useEffect, memo, useCallback, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Eye,
  RefreshCw,
  ChevronRight,
  Clock,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  Bookmark,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { bn } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'
import { CURATED_FASHION_ARTICLES } from '@/lib/fashionArticles'

// --------------------------------------------------------------
// Helpers
// --------------------------------------------------------------
const getRelativeTime = (date, lang) => {
  if (!date) return ''
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    const locale = lang === 'bn' ? bn : undefined
    return formatDistanceToNow(d, { addSuffix: true, locale })
  } catch {
    return ''
  }
}

const getCategoryBangla = (category) => {
  const map = {
    Fashion: 'ফ্যাশন',
    Style: 'স্টাইল ও সৌন্দর্য',
    Lifestyle: 'লাইফস্টাইল',
    Politics: 'রাজনীতি',
    Business: 'বাণিজ্য',
    Sports: 'খেলা',
    Entertainment: 'বিনোদন',
    Technology: 'প্রযুক্তি',
    International: 'আন্তর্জাতিক',
    National: 'জাতীয়',
    Satire: 'স্যাটায়ার',
  }
  return map[category] || category
}

// --------------------------------------------------------------
// Loading Skeleton Component
// --------------------------------------------------------------
const MagazineSkeleton = () => (
  <div className="animate-pulse space-y-8">
    <div className="h-10 bg-gray-200 rounded w-1/3"></div>
    <div className="grid lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 h-96 bg-gray-200 rounded-lg"></div>
      <div className="lg:col-span-4 space-y-4">
        <div className="h-44 bg-gray-200 rounded-lg"></div>
        <div className="h-44 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
    <div className="grid md:grid-cols-4 gap-6 pt-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
      ))}
    </div>
  </div>
)

// --------------------------------------------------------------
// Main Home Component
// --------------------------------------------------------------
export default function Home({ params: { lang } }) {
  const [featuredArticles, setFeaturedArticles] = useState([])
  const [latestArticles, setLatestArticles] = useState([])
  const [fashionArticles, setFashionArticles] = useState(CURATED_FASHION_ARTICLES)
  const [categoryArticles, setCategoryArticles] = useState({})
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const isBn = lang === 'bn'

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [featuredRes, latestRes, fashionRes] = await Promise.all([
        supabase
          .from('articles')
          .select('*')
          .eq('status', 'published')
          .eq('is_featured', true)
          .limit(6),
        supabase
          .from('articles')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(16),
        supabase
          .from('articles')
          .select('*')
          .ilike('category', '%fashion%')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(8),
      ])

      const dbFeatured = featuredRes.data || []
      const dbLatest = latestRes.data || []
      const dbFashion = fashionRes.data || []

      // Merge curated fashion pieces with any database items
      const seenFashionIds = new Set(dbFashion.map((a) => a.id))
      const combinedFashion = [...dbFashion]
      CURATED_FASHION_ARTICLES.forEach((item) => {
        if (!seenFashionIds.has(item.id)) {
          combinedFashion.push(item)
        }
      })

      setFashionArticles(combinedFashion)
      setFeaturedArticles(dbFeatured.length > 0 ? dbFeatured : combinedFashion.slice(0, 4))
      setLatestArticles(dbLatest.length > 0 ? dbLatest : combinedFashion)

      // Fetch category groupings for secondary sections
      const categories = ['Politics', 'Entertainment', 'Sports', 'Technology']
      const catData = {}

      await Promise.all(
        categories.map(async (cat) => {
          const { data } = await supabase
            .from('articles')
            .select('*')
            .eq('status', 'published')
            .eq('category', cat)
            .order('published_at', { ascending: false })
            .limit(4)
          if (data?.length) catData[cat] = data
        })
      )

      setCategoryArticles(catData)
    } catch (err) {
      console.warn('API error in fetchArticles:', err)
      // Fallback to rich curated fashion articles so the page is always visually vibrant
      setFashionArticles(CURATED_FASHION_ARTICLES)
      setFeaturedArticles(CURATED_FASHION_ARTICLES.slice(0, 4))
      setLatestArticles(CURATED_FASHION_ARTICLES)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  const getLocalizedTitle = useCallback(
    (a) => (isBn && a.title_bn ? a.title_bn : a.title),
    [isBn]
  )

  const getLocalizedExcerpt = useCallback(
    (a) => (isBn && a.excerpt_bn ? a.excerpt_bn : a.excerpt || ''),
    [isBn]
  )

  // Primary Fashion Spotlight items
  const leadFashionArticle = fashionArticles[0] || CURATED_FASHION_ARTICLES[0]
  const secondaryFashionArticles = fashionArticles.slice(1, 4)

  // Filtered collection based on interactive tabs
  const filteredCollection = useMemo(() => {
    if (activeTab === 'all') {
      return [...fashionArticles, ...latestArticles.filter((a) => !fashionArticles.some((f) => f.id === a.id))]
    }
    if (activeTab === 'fashion') {
      return fashionArticles.filter((a) => (a.category || '').toLowerCase().includes('fashion'))
    }
    if (activeTab === 'style') {
      return fashionArticles.filter((a) => (a.category || '').toLowerCase().includes('style'))
    }
    if (activeTab === 'news') {
      return latestArticles.filter(
        (a) =>
          !['fashion', 'style'].includes((a.category || '').toLowerCase())
      )
    }
    return fashionArticles
  }, [activeTab, fashionArticles, latestArticles])

  if (loading) {
    return (
      <div className="bg-[#FAF8F5] min-h-screen py-8">
        <div className="container-custom max-w-screen-xl">
          <MagazineSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-stone-900 font-sans pb-16">
      <div className="container-custom max-w-screen-xl pt-4">

        {/* ------------------------------------------------------------ */}
        {/* EDITORIAL TOP KICKER STRIP */}
        {/* ------------------------------------------------------------ */}
        <div className="border-b border-stone-200 pb-3 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-red-700 font-semibold">
            <Sparkles size={14} className="shrink-0" />
            <span>{isBn ? 'ফ্যাশন ও স্টাইল বিশেষ সংস্করণ' : 'FASHION & STYLE SPECIAL EDITORIAL'}</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="text-stone-500 font-normal">
              {isBn ? 'সমকালীন রানওয়ে ও জীবনধারা' : 'Contemporary Runway & Life Aesthetics'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-stone-500">
            <span>{isBn ? 'সংকলন ২০২৬' : 'Edition 2026'}</span>
            <span aria-hidden="true">·</span>
            <Link
              href={`/${lang}/category/fashion`}
              className="text-stone-700 hover:text-red-700 transition font-medium underline-offset-4 hover:underline"
            >
              {isBn ? 'সব ফ্যাশন আর্টিকেল' : 'Explore All Fashion'}
            </Link>
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* ZONE 1: DOMINANT FASHION LEAD HERO & SPOTLIGHT GRID */}
        {/* ------------------------------------------------------------ */}
        <section className="mb-14">
          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Lead Story: 7 Columns */}
            <div className="lg:col-span-7 flex flex-col">
              <Link
                href={`/${lang}/article/${leadFashionArticle.id}`}
                className="group flex-1 flex flex-col bg-white rounded-xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition duration-300"
              >
                <div className="relative aspect-[16/10] w-full bg-stone-100 overflow-hidden">
                  <Image
                    src={leadFashionArticle.featured_image || '/images/fashion/hero.jpg'}
                    alt={getLocalizedTitle(leadFashionArticle)}
                    fill
                    priority
                    className="object-cover group-hover:scale-105 transition duration-700 ease-out"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                  />
                  <div className="absolute top-4 left-4 bg-stone-900/80 backdrop-blur-sm text-white px-3 py-1 rounded text-xs uppercase tracking-wider font-medium">
                    {isBn ? 'কভার স্টোরি · ফ্যাশন' : 'COVER STORY · FASHION'}
                  </div>
                </div>

                <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                      <span className="font-semibold text-red-700 uppercase tracking-wide">
                        {isBn ? 'আন্তর্জাতিক রানওয়ে' : 'Global Runway'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{getRelativeTime(leadFashionArticle.published_at, lang)}</span>
                    </div>

                    <h1 className={`text-2xl md:text-3xl lg:text-4xl font-serif font-bold tracking-tight text-stone-900 group-hover:text-red-700 transition leading-snug ${
                      isBn ? 'font-bangla' : ''
                    }`}>
                      {getLocalizedTitle(leadFashionArticle)}
                    </h1>

                    <p className="text-stone-600 text-sm md:text-base mt-3 line-clamp-3 leading-relaxed">
                      {getLocalizedExcerpt(leadFashionArticle)}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                    <span className="font-medium text-stone-700">{leadFashionArticle.author}</span>
                    <span className="inline-flex items-center gap-1 text-red-700 font-semibold group-hover:translate-x-1 transition">
                      {isBn ? 'সম্পূর্ণ পড়ুন' : 'Read Full Story'}
                      <ArrowUpRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Side Spotlights: 5 Columns */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <h2 className="text-sm font-bold uppercase tracking-wider text-stone-700 flex items-center gap-2">
                  <TrendingUp size={16} className="text-red-700" />
                  {isBn ? 'স্টাইল ও ট্রেন্ডস স্পটলাইট' : 'Style & Trend Spotlights'}
                </h2>
                <Link
                  href={`/${lang}/category/style`}
                  className="text-xs text-red-700 hover:underline font-medium"
                >
                  {isBn ? 'স্টাইল বিভাগ' : 'Style Desk'} →
                </Link>
              </div>

              {secondaryFashionArticles.map((article, idx) => (
                <Link
                  key={article.id}
                  href={`/${lang}/article/${article.id}`}
                  className="group flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-xl border border-stone-200 hover:border-stone-300 shadow-sm hover:shadow transition duration-200"
                >
                  <div className="relative w-full sm:w-36 h-36 shrink-0 bg-stone-100 rounded-lg overflow-hidden">
                    <Image
                      src={article.featured_image || '/images/fashion/streetwear.jpg'}
                      alt={getLocalizedTitle(article)}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-500"
                      sizes="(max-width: 640px) 100vw, 150px"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                        <span className="text-red-700 font-medium">
                          {isBn ? getCategoryBangla(article.category) : article.category}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{getRelativeTime(article.published_at, lang)}</span>
                      </div>

                      <h3 className={`font-serif font-bold text-base text-stone-900 group-hover:text-red-700 transition line-clamp-2 leading-snug ${
                        isBn ? 'font-bangla' : ''
                      }`}>
                        {getLocalizedTitle(article)}
                      </h3>

                      <p className="text-stone-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                        {getLocalizedExcerpt(article)}
                      </p>
                    </div>

                    <div className="text-xs text-stone-400 flex items-center justify-between mt-3">
                      <span className="truncate max-w-[150px]">{article.author}</span>
                      <span className="flex items-center gap-1">
                        <Eye size={12} /> {article.views || 850}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* ZONE 2: FASHION & STYLE LOOKBOOK GALLERY STRIP */}
        {/* ------------------------------------------------------------ */}
        <section className="mb-14 bg-white p-6 md:p-8 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 pb-4 border-b border-stone-100 gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-red-700 font-semibold mb-1">
                {isBn ? 'কিউরেটেড লুকবুক' : 'CURATED LOOKBOOK'}
              </p>
              <h2 className={`text-2xl md:text-3xl font-serif font-bold text-stone-900 ${
                isBn ? 'font-bangla' : ''
              }`}>
                {isBn ? 'ফ্যাশন ট্রেন্ডস ও নান্দনিক সাজসজ্জা' : 'Fashion Trends & Aesthetic Lookbook'}
              </h2>
            </div>
            <p className="text-stone-500 text-xs md:text-sm max-w-md">
              {isBn
                ? 'ঐতিহ্যবাহী তাঁতশিল্প, আধুনিক সুতি ও সমকালীন আর্ট সিলুয়েটের মেলবন্ধনে বিশেষ পোর্টফোলিও।'
                : 'A curated visual dialogue between handloom textiles, contemporary denim, and modern jewelry.'}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CURATED_FASHION_ARTICLES.map((item, index) => (
              <Link
                key={item.id}
                href={`/${lang}/article/${item.id}`}
                className="group flex flex-col bg-stone-50 rounded-xl overflow-hidden border border-stone-100 hover:border-stone-300 transition duration-300 hover:shadow-md"
              >
                <div className="relative aspect-[4/3] w-full bg-stone-200 overflow-hidden">
                  <Image
                    src={item.featured_image}
                    alt={getLocalizedTitle(item)}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-500"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                  <div className="absolute bottom-2 left-2 bg-stone-900/70 text-white text-[11px] font-mono px-2 py-0.5 rounded backdrop-blur-sm">
                    0{index + 1} · {item.category}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className={`font-serif font-bold text-base text-stone-900 group-hover:text-red-700 transition line-clamp-2 leading-snug ${
                      isBn ? 'font-bangla' : ''
                    }`}>
                      {getLocalizedTitle(item)}
                    </h3>
                    <p className="text-stone-600 text-xs mt-2 line-clamp-2 leading-relaxed">
                      {getLocalizedExcerpt(item)}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-stone-200/60 flex items-center justify-between text-xs text-stone-500">
                    <span className="truncate">{item.author.split('·')[0]}</span>
                    <span className="text-red-700 font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition">
                      {isBn ? 'দেখুন' : 'View'} →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* ZONE 3: INTERACTIVE FILTER TABS & EDITORIAL GRID */}
        {/* ------------------------------------------------------------ */}
        <section className="mb-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-3 border-b border-stone-200">
            <div>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-stone-900">
                {isBn ? 'বিষয়ভিত্তিক বিভাগ ও সর্বশেষ কন্টেন্ট' : 'Curated Desks & Latest Editions'}
              </h2>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-stone-200/60 rounded-lg overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  activeTab === 'all'
                    ? 'bg-white text-stone-900 shadow-sm font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {isBn ? 'সব আর্টিকেল' : 'All Collections'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('fashion')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  activeTab === 'fashion'
                    ? 'bg-white text-stone-900 shadow-sm font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                ✨ {isBn ? 'ফ্যাশন' : 'Fashion'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('style')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  activeTab === 'style'
                    ? 'bg-white text-stone-900 shadow-sm font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                💎 {isBn ? 'স্টাইল ও সৌন্দর্য' : 'Style & Beauty'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('news')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  activeTab === 'news'
                    ? 'bg-white text-stone-900 shadow-sm font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                📰 {isBn ? 'সাধারণ সংবাদ' : 'General News'}
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCollection.slice(0, 9).map((article) => (
              <Link
                key={article.id}
                href={`/${lang}/article/${article.id}`}
                className="group bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
              >
                <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden">
                  {article.featured_image ? (
                    <Image
                      src={article.featured_image}
                      alt={getLocalizedTitle(article)}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400 font-mono text-xs font-bold tracking-widest">
                      MEMEBAZ
                    </div>
                  )}
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-stone-900 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                    {isBn ? getCategoryBangla(article.category) : article.category}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className={`font-serif font-bold text-lg text-stone-900 group-hover:text-red-700 transition line-clamp-2 leading-snug ${
                      isBn ? 'font-bangla' : ''
                    }`}>
                      {getLocalizedTitle(article)}
                    </h3>
                    <p className="text-stone-600 text-sm mt-2 line-clamp-2 leading-relaxed">
                      {getLocalizedExcerpt(article)}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {getRelativeTime(article.published_at, lang)}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Eye size={12} /> {article.views || 0}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* ZONE 4: FASHION STYLE GUIDE & WARDROBE ESSENTIALS COLUMNS */}
        {/* ------------------------------------------------------------ */}
        <section className="mb-14 p-6 md:p-8 bg-stone-900 text-white rounded-2xl shadow-lg">
          <div className="border-b border-stone-800 pb-4 mb-6 flex flex-col sm:flex-row justify-between sm:items-end gap-2">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-red-400">
                {isBn ? 'এডিটোরিয়াল গাইড' : 'STYLE GUIDE & PRINCIPLES'}
              </span>
              <h2 className="text-2xl md:text-3xl font-serif font-bold mt-1">
                {isBn ? 'আধুনিক ওয়ারড্রোব ও স্টাইলিং নির্দেশিকা' : 'Capsule Wardrobe & Styling Architecture'}
              </h2>
            </div>
            <Link
              href={`/${lang}/category/style`}
              className="text-xs text-stone-300 hover:text-white underline underline-offset-4"
            >
              {isBn ? 'সব স্টাইল গাইড দেখুন' : 'Explore All Style Articles'} →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-5 bg-stone-800/80 rounded-xl border border-stone-700">
              <span className="text-red-400 font-mono text-xs tracking-wider">01 · ESSENTIAL</span>
              <h3 className="text-lg font-serif font-bold text-white mt-2 mb-2">
                {isBn ? 'ক্যাপসুল ওয়ারড্রোব তৈরির মূলমন্ত্র' : 'The 10-Piece Capsule Wardrobe'}
              </h3>
              <p className="text-stone-300 text-xs leading-relaxed">
                {isBn
                  ? 'কম পোশাকে বেশি বৈচিত্র্য আনার জন্য নিউট্রাল কালারের লিনেন শার্ট, ক্লাসিক ট্রাউজার এবং কোয়ালিটি ডেনিমের চমৎকার সমাবেশ।'
                  : 'Investing in high-density cotton shirts, tailored dark trousers, and versatile outer layers for timeless elegance.'}
              </p>
            </div>

            <div className="p-5 bg-stone-800/80 rounded-xl border border-stone-700">
              <span className="text-red-400 font-mono text-xs tracking-wider">02 · TEXTILES</span>
              <h3 className="text-lg font-serif font-bold text-white mt-2 mb-2">
                {isBn ? 'আবহাওয়া উপযোগী খাদি ও লিনেন' : 'Hand-Spun Khadi & Breathable Linen'}
              </h3>
              <p className="text-stone-300 text-xs leading-relaxed">
                {isBn
                  ? 'গ্রীষ্ম ও বর্ষার আর্দ্রতায় আরামদায়ক প্রাকৃতিক ফ্যাব্রিক আপনাকে দেবে সারাদিন সতেজতা ও অভিজাত লুক।'
                  : 'Why natural indigenous handlooms and unbleached cottons provide superior thermal comfort and tactile luxury.'}
              </p>
            </div>

            <div className="p-5 bg-stone-800/80 rounded-xl border border-stone-700">
              <span className="text-red-400 font-mono text-xs tracking-wider">03 · ACCESSORIES</span>
              <h3 className="text-lg font-serif font-bold text-white mt-2 mb-2">
                {isBn ? 'মিনিমালিস্ট মেটাল ও লেদার এক্সেসরিজ' : 'Artisanal Brass & Minimalist Leather'}
              </h3>
              <p className="text-stone-300 text-xs leading-relaxed">
                {isBn
                  ? 'হাতে গড়া ব্রাস কাফ, হালকা ড্রপ ইয়াররিংস এবং প্রিমিয়াম লেদার টোট যেকোনো সাদামাটা আউটফিটকে দেয় হাই-ফ্যাশন লুক।'
                  : 'Elevating everyday monochrome attire with understated handcrafted brass and heirloom-grade leather.'}
              </p>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* ZONE 5: GENERAL NEWS CATEGORY ARCHIVE (PRESERVED) */}
        {/* ------------------------------------------------------------ */}
        {Object.keys(categoryArticles).length > 0 && (
          <section className="mt-8 space-y-12">
            <div className="border-b-2 border-stone-200 pb-2 mb-4">
              <h2 className="text-xl md:text-2xl font-bold font-serif text-stone-900">
                {isBn ? 'সংবাদ ও অন্যান্য বিভাগ' : 'Newspaper Desks & General Coverage'}
              </h2>
            </div>

            {Object.entries(categoryArticles).map(([category, articles]) => (
              <div key={category} className="space-y-4">
                <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                  <h3 className="text-lg font-bold font-serif text-stone-800">
                    {isBn ? getCategoryBangla(category) : category}
                  </h3>
                  <Link
                    href={`/${lang}/category/${category.toLowerCase()}`}
                    className="text-red-700 text-xs font-semibold flex items-center gap-1 hover:underline"
                  >
                    {isBn ? 'সব দেখুন' : 'See all'} <ChevronRight size={14} />
                  </Link>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {articles.slice(0, 4).map((article) => (
                    <Link
                      key={article.id}
                      href={`/${lang}/article/${article.id}`}
                      className="group bg-white p-3 rounded-lg border border-stone-200 hover:border-stone-300 transition shadow-sm hover:shadow"
                    >
                      {article.featured_image && (
                        <div className="relative aspect-[16/10] bg-stone-100 rounded overflow-hidden mb-2.5">
                          <Image
                            src={article.featured_image}
                            alt={getLocalizedTitle(article)}
                            fill
                            className="object-cover group-hover:scale-105 transition duration-300"
                            sizes="(max-width: 768px) 100vw, 25vw"
                          />
                        </div>
                      )}
                      <h4 className={`text-sm font-semibold line-clamp-2 group-hover:text-red-700 transition ${
                        isBn ? 'font-bangla' : ''
                      }`}>
                        {getLocalizedTitle(article)}
                      </h4>
                      <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                        <Clock size={11} />
                        {getRelativeTime(article.published_at, lang)}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

      </div>
    </div>
  )
}
