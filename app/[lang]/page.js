'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Eye,
  ChevronRight,
  Clock,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  Flame,
  Quote,
  Vote,
  Volume2,
  RefreshCw,
  Award,
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
    Satire: 'স্যাটায়ার',
    Meme: 'মিম ও রোস্ট',
    Fashion: 'নেতা ফ্যাশন',
    Style: 'স্টাইল ও ক্ষমতা',
    Lifestyle: 'লাইফস্টাইল',
    Politics: 'রাজনীতি',
    Business: 'ব্যবসা ও টেন্ডার',
    Sports: 'খেলা ও মারপিট',
    Entertainment: 'বিনোদন',
    Technology: 'ডিজিটাল নেতা',
  }
  return map[category] || category
}

const NETA_QUOTES = [
  {
    bn: '“আমি তো ভাই আপনাদেরই সন্তান, আমার নিজের কোনো চাওয়া-পাওয়া নাই... সব আপনাদের জন্য!”',
    en: '"I am merely a humble son of your soil; I have no personal ambitions... everything is for you!"',
    author: 'জনৈক সর্বহারা নেতা (প্রাক্তন প্রাডো মালিক)',
  },
  {
    bn: '“বিরোধীরা রাতের আঁধারে আমার বিরুদ্ধে আন্তর্জাতিক ষড়যন্ত্র লিপ্ত হয়েছে!”',
    en: '"Opposition elements are plotting an international conspiracy against me in the dead of night!"',
    author: 'ওয়ার্ড কাউন্সিলর পদপ্রার্থী',
  },
  {
    bn: '“উন্নয়ন কিন্তু চলমান... একটু ধৈর্য ধরেন, আগামী ১০ বছরের মধ্যেই কাজ দৃশ্যমান হবে!”',
    en: '"Development is in full swing... be patient, the bridge will be visible in just 10 years!"',
    author: 'সড়ক ও কালভার্ট পর্যবেক্ষক কমিটি',
  },
  {
    bn: '“আমার পেছনে যারা দাঁড়িয়ে সেলফি তুলছে, তাদের সবাইকে আমি ব্যক্তিগতভাবে চিনি না!”',
    en: '"I do not personally know all 80 individuals standing behind me in every photograph!"',
    author: 'ভাইরাল নেতা পরিষদ',
  },
  {
    bn: '“মিডিয়া আমার বক্তব্যের ভুল ব্যাখ্যা দিয়েছে, আমি আসলে সিঙ্গাড়ার কথা বলিনি—বিকাশের কথা বলেছি!”',
    en: '"The media misquoted me! I did not mention unserved singaras, I meant economic development!"',
    author: 'জরুরি প্রেস ব্রিফিং',
  },
]

const TICKER_ITEMS = [
  '🚨 ব্রেকিং: মাইক পেলেই ২ ঘণ্টার ভাষণ শেষ না করায় কর্মীদের মুখে একটাই প্রশ্ন: সিঙ্গাড়াটা কই?',
  '📢 জরুরি বিজ্ঞপ্তি: পোস্টারে নিজের ছবি বড় করতে গিয়ে দলের প্রধানের মুখ ঢেকে দেওয়ায় তদন্ত কমিটি গঠন!',
  '☕ টং কূটনীতি: মোতালেব ভাইয়ের দোকানে আধা কাপ চায়ে মধ্যপ্রাচ্য সংকট সমাধান করলেন তিন চাচা!',
  '📸 ফটোসেশন স্পেশাল: রিকশায় চড়ে ছবি তোলার পর ১০ টাকার ভাড়া বাকি রেখেই উধাও ভিআইপি কনভয়!',
  '🕶️ স্টাইল আপডেট: রাত ১০টায় কমিউনিটি সেন্টারে সানগ্লাস পরার বিশেষ নির্দেশিকা প্রকাশ করল নেতা গিল্ড!',
]

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
  const [satireArticles, setSatireArticles] = useState(CURATED_FASHION_ARTICLES)
  const [categoryArticles, setCategoryArticles] = useState({})
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(true)

  // Interactive Quote Generator
  const [quoteIndex, setQuoteIndex] = useState(0)

  // Interactive Satire Poll
  const [votedOption, setVotedOption] = useState(null)
  const [pollVotes, setPollVotes] = useState({ 0: 64, 1: 26, 2: 10 })

  const isBn = lang === 'bn'

  const fetchArticles = useCallback(async () => {
    setLoading(true)

    try {
      const [featuredRes, latestRes, satireRes] = await Promise.all([
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
          .or('category.ilike.%satire%,category.ilike.%meme%,category.ilike.%fashion%')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(8),
      ])

      const dbFeatured = featuredRes.data || []
      const dbLatest = latestRes.data || []
      const dbSatire = satireRes.data || []

      // Merge curated satire pieces with any database items
      const seenIds = new Set(dbSatire.map((a) => a.id))
      const combinedSatire = [...dbSatire]
      CURATED_FASHION_ARTICLES.forEach((item) => {
        if (!seenIds.has(item.id)) {
          combinedSatire.push(item)
        }
      })

      setSatireArticles(combinedSatire)
      setFeaturedArticles(dbFeatured.length > 0 ? dbFeatured : combinedSatire.slice(0, 4))
      setLatestArticles(dbLatest.length > 0 ? dbLatest : combinedSatire)

      // Fetch category groupings for secondary sections
      const categories = ['Politics', 'Entertainment', 'Satire', 'Sports']
      const catData = {}

      await Promise.all(
        categories.map(async (cat) => {
          const { data } = await supabase
            .from('articles')
            .select('*')
            .eq('status', 'published')
            .ilike('category', `%${cat}%`)
            .order('published_at', { ascending: false })
            .limit(4)
          if (data?.length) catData[cat] = data
        })
      )

      setCategoryArticles(catData)
    } catch (err) {
      console.warn('API error in fetchArticles:', err)
      setSatireArticles(CURATED_FASHION_ARTICLES)
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

  // Primary Satire Lead item
  const leadArticle = satireArticles[0] || CURATED_FASHION_ARTICLES[0]
  const secondaryArticles = satireArticles.slice(1, 4)

  // Filtered collection based on interactive tabs
  const filteredCollection = useMemo(() => {
    if (activeTab === 'all') {
      return satireArticles
    }
    if (activeTab === 'speech') {
      return satireArticles.filter(
        (a) =>
          a.id.includes('speech') ||
          (a.title || '').toLowerCase().includes('speech') ||
          (a.title_bn || '').includes('ভাষণ')
      )
    }
    if (activeTab === 'pr') {
      return satireArticles.filter(
        (a) =>
          a.id.includes('rickshaw') ||
          a.id.includes('sunglass') ||
          (a.category || '').toLowerCase().includes('meme')
      )
    }
    if (activeTab === 'tong') {
      return satireArticles.filter(
        (a) =>
          a.id.includes('tea') ||
          (a.title || '').toLowerCase().includes('tea') ||
          (a.title_bn || '').includes('টং')
      )
    }
    return satireArticles
  }, [activeTab, satireArticles])

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % NETA_QUOTES.length)
  }

  const handleVote = (index) => {
    if (votedOption !== null) return
    setVotedOption(index)
    setPollVotes((prev) => ({
      ...prev,
      [index]: prev[index] + 1,
    }))
  }

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
        {/* LIVE SATIRICAL NEWS TICKER STRIP */}
        {/* ------------------------------------------------------------ */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 mb-6 flex items-center gap-3 overflow-hidden shadow-xs">
          <div className="bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded flex items-center gap-1.5 shrink-0 uppercase tracking-wider font-bangla">
            <Flame size={14} className="animate-bounce" />
            <span>{isBn ? 'নেতা অ্যালার্ট' : 'NETA ALERT'}</span>
          </div>
          <div className="overflow-x-auto whitespace-nowrap text-xs text-red-900 font-medium py-0.5 flex gap-6 animate-pulse">
            {TICKER_ITEMS.map((item, idx) => (
              <span key={idx} className="inline-flex items-center gap-2">
                <span>{item}</span>
                <span className="text-red-300">★</span>
              </span>
            ))}
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* EDITORIAL TOP KICKER STRIP */}
        {/* ------------------------------------------------------------ */}
        <div className="border-b border-stone-200 pb-3 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-red-700 font-semibold">
            <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded font-bangla">
              ওরে নেতা রে স্পেশাল
            </span>
            <Sparkles size={14} className="shrink-0" />
            <span>{isBn ? 'ভাইরাল মিমস, স্যাটায়ার ও পলিটিক্যাল রোস্ট' : 'VIRAL MEMES, SATIRE & POLITICAL ROASTS'}</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="text-stone-500 font-normal">
              {isBn ? 'নেতাদের অদ্ভুত কাণ্ডকারখানা ও টং কূটনীতি' : 'Political Antics, PR Stunts & Relatable Culture'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-stone-500">
            <span>{isBn ? 'এডিশন ২০২৬' : 'Edition 2026'}</span>
            <span aria-hidden="true">·</span>
            <Link
              href={`/${lang}/category/satire`}
              className="text-stone-700 hover:text-red-700 transition font-medium underline-offset-4 hover:underline"
            >
              {isBn ? 'সব স্যাটায়ার আর্টিকেল' : 'Explore All Satire'}
            </Link>
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* ZONE 1: DOMINANT HERO LEAD SATIRE & SPOTLIGHT GRID */}
        {/* ------------------------------------------------------------ */}
        <section className="mb-14">
          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Lead Story: 7 Columns */}
            <div className="lg:col-span-7 flex flex-col">
              <Link
                href={`/${lang}/article/${leadArticle.id}`}
                className="group flex-1 flex flex-col bg-white rounded-xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition duration-300"
              >
                <div className="relative aspect-[16/10] w-full bg-stone-100 overflow-hidden">
                  <Image
                    src={leadArticle.featured_image || '/images/satire/hero.jpg'}
                    alt={getLocalizedTitle(leadArticle)}
                    fill
                    priority
                    className="object-cover group-hover:scale-105 transition duration-700 ease-out"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                  />
                  <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded text-xs uppercase tracking-wider font-bold shadow-md">
                    {isBn ? '🔥 কভার স্টোরি · ওরে নেতা রে' : '🔥 COVER STORY · ORE NETA RE'}
                  </div>
                </div>

                <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                      <span className="font-semibold text-red-700 uppercase tracking-wide">
                        {isBn ? 'আঞ্চলিক সম্মেলন' : 'Local Rally Report'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{getRelativeTime(leadArticle.published_at, lang)}</span>
                    </div>

                    <h1 className={`text-2xl md:text-3xl lg:text-4xl font-serif font-bold tracking-tight text-stone-900 group-hover:text-red-700 transition leading-snug ${
                      isBn ? 'font-bangla' : ''
                    }`}>
                      {getLocalizedTitle(leadArticle)}
                    </h1>

                    <p className="text-stone-600 text-sm md:text-base mt-3 line-clamp-3 leading-relaxed">
                      {getLocalizedExcerpt(leadArticle)}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                    <span className="font-medium text-stone-700">{leadArticle.author}</span>
                    <span className="inline-flex items-center gap-1 text-red-700 font-semibold group-hover:translate-x-1 transition">
                      {isBn ? 'পুরো রোস্ট পড়ুন' : 'Read Full Satire'}
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
                  {isBn ? 'ভাইরাল নেতা স্পটলাইট' : 'Viral Leader Spotlights'}
                </h2>
                <Link
                  href={`/${lang}/category/meme`}
                  className="text-xs text-red-700 hover:underline font-medium"
                >
                  {isBn ? 'মিম ডেস্ক' : 'Meme Desk'} →
                </Link>
              </div>

              {secondaryArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/${lang}/article/${article.id}`}
                  className="group flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-xl border border-stone-200 hover:border-stone-300 shadow-sm hover:shadow transition duration-200"
                >
                  <div className="relative w-full sm:w-36 h-36 shrink-0 bg-stone-100 rounded-lg overflow-hidden">
                    <Image
                      src={article.featured_image || '/images/satire/rickshaw.jpg'}
                      alt={getLocalizedTitle(article)}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-500"
                      sizes="(max-width: 640px) 100vw, 150px"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                        <span className="text-red-700 font-semibold">
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
                      <span className="flex items-center gap-1 font-mono">
                        <Eye size={12} /> {article.views || 920}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* ZONE 2: INTERACTIVE SATIRE WIDGETS (QUOTE GENERATOR & POLL) */}
        {/* ------------------------------------------------------------ */}
        <section className="mb-14 grid md:grid-cols-2 gap-6">
          
          {/* Widget A: The Neta Quote Generator */}
          <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white p-6 md:p-8 rounded-2xl shadow-md border border-stone-700 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-stone-700 pb-3 mb-4">
                <span className="text-xs font-mono uppercase tracking-widest text-red-400 font-semibold flex items-center gap-1.5">
                  <Quote size={16} />
                  {isBn ? 'নেতাজীর অমর বাণী জেনারেটর' : 'IMMORTAL NETA QUOTES'}
                </span>
                <span className="text-xs text-stone-400 font-mono">
                  #{quoteIndex + 1} / {NETA_QUOTES.length}
                </span>
              </div>

              <blockquote className="text-lg md:text-xl font-serif font-semibold text-yellow-300 leading-relaxed my-4 min-h-[90px]">
                {isBn ? NETA_QUOTES[quoteIndex].bn : NETA_QUOTES[quoteIndex].en}
              </blockquote>

              <p className="text-xs text-stone-400 font-medium">
                — {NETA_QUOTES[quoteIndex].author}
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-stone-800 flex items-center justify-between">
              <span className="text-xs text-stone-500">
                {isBn ? 'নতুন বাণী শুনতে ক্লিক করুন' : 'Click to hear another gem'}
              </span>
              <button
                type="button"
                onClick={handleNextQuote}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 active:scale-95 shadow-sm"
              >
                <RefreshCw size={14} />
                {isBn ? 'পরবর্তী বাণী শুনুন' : 'Next Quote'}
              </button>
            </div>
          </div>

          {/* Widget B: The Daily Satire Poll */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-stone-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
                <span className="text-xs font-mono uppercase tracking-widest text-red-700 font-semibold flex items-center gap-1.5">
                  <Vote size={16} />
                  {isBn ? 'আজকের লাইভ নেতা পোল' : 'DAILY SATIRE POLL'}
                </span>
                <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded font-mono font-bold">
                  LIVE
                </span>
              </div>

              <h3 className="font-serif font-bold text-base md:text-lg text-stone-900 mb-4">
                {isBn
                  ? 'আপনার এলাকার নেতা শেষ কবে নিজের পকেটের টাকায় কর্মীদের চা খাইয়েছেন?'
                  : 'When was the last time your local leader treated workers to tea from his own pocket?'}
              </h3>

              <div className="space-y-3">
                {[
                  {
                    bn: 'ক) মনে পড়ে না, হয়তো প্রাগৈতিহাসিক যুগে',
                    en: 'A) Cannot remember, probably pre-historic times',
                  },
                  {
                    bn: 'খ) ফেসবুক লাইভ চলাকালীন ক্যামেরার সামনে একবার',
                    en: 'B) Once while on Facebook Live in front of cameras',
                  },
                  {
                    bn: 'গ) উনি কেবল বড় বড় ভাষণ দেন, চায়ের বিল দেয় কর্মীরাই',
                    en: 'C) He gives grand speeches; workers secretly split the bill',
                  },
                ].map((opt, i) => {
                  const total = pollVotes[0] + pollVotes[1] + pollVotes[2]
                  const pct = Math.round((pollVotes[i] / total) * 100)
                  const isSelected = votedOption === i

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleVote(i)}
                      disabled={votedOption !== null}
                      className={`w-full text-left p-3 rounded-xl border text-xs md:text-sm transition relative overflow-hidden ${
                        isSelected
                          ? 'border-red-600 bg-red-50/50 font-semibold text-red-950'
                          : 'border-stone-200 hover:border-red-300 bg-stone-50/50 text-stone-800'
                      }`}
                    >
                      {votedOption !== null && (
                        <div
                          className="absolute inset-y-0 left-0 bg-red-200/40 -z-0 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      )}
                      <div className="relative z-10 flex items-center justify-between gap-2">
                        <span>{isBn ? opt.bn : opt.en}</span>
                        {votedOption !== null && (
                          <span className="font-mono text-xs font-bold shrink-0">
                            {pct}%
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <p className="text-[11px] text-stone-500 mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
              <span>{votedOption !== null ? (isBn ? 'ভোট দেওয়ার জন্য ধন্যবাদ!' : 'Vote recorded!') : (isBn ? 'আপনার পছন্দের উত্তরে ক্লিক করে ভোট দিন' : 'Click an option to cast your vote')}</span>
              <span className="font-mono font-semibold">
                {pollVotes[0] + pollVotes[1] + pollVotes[2]} {isBn ? 'ভোট' : 'votes'}
              </span>
            </p>
          </div>

        </section>

        {/* ------------------------------------------------------------ */}
        {/* ZONE 3: VIRAL NETA LOOKBOOK & MEME GALLERY STRIP */}
        {/* ------------------------------------------------------------ */}
        <section className="mb-14 bg-white p-6 md:p-8 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 pb-4 border-b border-stone-100 gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-red-700 font-semibold mb-1 flex items-center gap-1.5">
                <Award size={14} />
                {isBn ? 'নেতাদের ফটো ফ্রেম ও ভাইরাল গ্যালারি' : 'VIRAL NETA PHOTO ALBUM'}
              </p>
              <h2 className={`text-2xl md:text-3xl font-serif font-bold text-stone-900 ${
                isBn ? 'font-bangla' : ''
              }`}>
                {isBn ? 'ওরে নেতা রে: ভাইরাল মুহূর্ত সংকলন' : 'Ore Neta Re: Iconic Satirical Moments'}
              </h2>
            </div>
            <p className="text-stone-500 text-xs md:text-sm max-w-md">
              {isBn
                ? 'মাইকের সামনে কান্না, রিকশায় আকস্মিক সেলফি এবং টংয়ের দোকানে বিশ্বযুদ্ধ সমাধান—সেরা ৪টি স্যাটায়ার দলিল।'
                : 'From marathon microphone speeches to sudden PR rickshaw rides—our curated archive of top satirical moments.'}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CURATED_FASHION_ARTICLES.map((item, index) => (
              <Link
                key={item.id}
                href={`/${lang}/article/${item.id}`}
                className="group flex flex-col bg-stone-50 rounded-xl overflow-hidden border border-stone-200 hover:border-red-300 transition duration-300 hover:shadow-md"
              >
                <div className="relative aspect-[4/3] w-full bg-stone-200 overflow-hidden">
                  <Image
                    src={item.featured_image}
                    alt={getLocalizedTitle(item)}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-500"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                  <div className="absolute bottom-2 left-2 bg-stone-900/80 text-white text-[11px] font-mono px-2 py-0.5 rounded backdrop-blur-sm">
                    EP-0{index + 1} · {item.category}
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
                      {isBn ? 'রোস্ট পড়ুন' : 'Read'} →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* ZONE 4: INTERACTIVE SATIRE FILTER TABS & COLLECTION */}
        {/* ------------------------------------------------------------ */}
        <section className="mb-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-3 border-b border-stone-200">
            <div>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-stone-900">
                {isBn ? 'বিষয়ভিত্তিক নেতা রোস্ট ও স্যাটায়ার' : 'Curated Neta Desks & Topics'}
              </h2>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-stone-200/60 rounded-lg overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  activeTab === 'all'
                    ? 'bg-red-600 text-white shadow-sm font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {isBn ? 'সব রোস্ট' : 'All Satire'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('speech')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  activeTab === 'speech'
                    ? 'bg-red-600 text-white shadow-sm font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                🎤 {isBn ? 'নেতার ভাষণ' : 'Mic Speeches'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pr')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  activeTab === 'pr'
                    ? 'bg-red-600 text-white shadow-sm font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                📸 {isBn ? 'পোস্টার ও পিআর' : 'PR & Selfies'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('tong')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  activeTab === 'tong'
                    ? 'bg-red-600 text-white shadow-sm font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                ☕ {isBn ? 'টংয়ের কূটনীতি' : 'Tea Stall Politics'}
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
                      ORE NETA RE
                    </div>
                  )}
                  <span className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
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
        {/* ZONE 5: SATIRICAL NETA STYLE GUIDE & WARDROBE ESSENTIALS */}
        {/* ------------------------------------------------------------ */}
        <section className="mb-14 p-6 md:p-8 bg-stone-900 text-white rounded-2xl shadow-lg">
          <div className="border-b border-stone-800 pb-4 mb-6 flex flex-col sm:flex-row justify-between sm:items-end gap-2">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-red-400 font-semibold">
                {isBn ? 'স্যাটায়ার স্টাইল গাইড' : 'SATIRICAL NETA MASTERCLASS'}
              </span>
              <h2 className="text-2xl md:text-3xl font-serif font-bold mt-1">
                {isBn ? 'নেতা হওয়ার ৩টি গোল্ডেন রুলস ও আচরণ নির্দেশিকা' : 'The 3 Golden Rules of Leader Styling & Behavior'}
              </h2>
            </div>
            <Link
              href={`/${lang}/category/style`}
              className="text-xs text-stone-300 hover:text-white underline underline-offset-4"
            >
              {isBn ? 'সব স্টাইল রোস্ট দেখুন' : 'Explore Style Roasts'} →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-5 bg-stone-800/80 rounded-xl border border-stone-700">
              <span className="text-red-400 font-mono text-xs tracking-wider font-bold">01 · WARDROBE</span>
              <h3 className="text-lg font-serif font-bold text-white mt-2 mb-2">
                {isBn ? 'কড়া মাড়ের ধবধবে সাদা পাঞ্জাবি' : 'The Stiff Starch White Panjabi'}
              </h3>
              <p className="text-stone-300 text-xs leading-relaxed">
                {isBn
                  ? 'কলার এত শক্ত হতে হবে যেন ঘাড় না ঘুরিয়ে পুরো শরীরসহ ১৮০ ডিগ্রি ঘুরতে হয়। এতে ক্ষমতার গাম্ভীর্য বহুগুণ বৃদ্ধি পায়।'
                  : 'Starch thickness must restrict neck movement so that you are forced to rotate your entire torso to acknowledge supporters.'}
              </p>
            </div>

            <div className="p-5 bg-stone-800/80 rounded-xl border border-stone-700">
              <span className="text-red-400 font-mono text-xs tracking-wider font-bold">02 · SUNGLASS</span>
              <h3 className="text-lg font-serif font-bold text-white mt-2 mb-2">
                {isBn ? 'মধ্যরাতে কালা চশমা পরিধান' : 'Midnight Aviator Paradox'}
              </h3>
              <p className="text-stone-300 text-xs leading-relaxed">
                {isBn
                  ? 'রাত ১০টায় কমিউনিটি সেন্টারের মিটিংয়ে সানগ্লাস পরলে কেউ বুঝবে না আপনি ঘুমিয়ে পড়েছেন নাকি দেশের অর্থনীতিক সংকট ভাবছেন!'
                  : 'Wearing dark UV glasses during nighttime hall rallies conceals whether you are meditating on diplomacy or taking a quick nap.'}
              </p>
            </div>

            <div className="p-5 bg-stone-800/80 rounded-xl border border-stone-700">
              <span className="text-red-400 font-mono text-xs tracking-wider font-bold">03 · MIC CONTROL</span>
              <h3 className="text-lg font-serif font-bold text-white mt-2 mb-2">
                {isBn ? 'মাইক ধরে না ছাড়ার সংকল্প' : 'The Grip of Iron on the Microphone'}
              </h3>
              <p className="text-stone-300 text-xs leading-relaxed">
                {isBn
                  ? 'মাইক হাতে এলে ৫ মিনিটের জায়গায় অন্তত দেড় ঘণ্টা কথা বলতে হবে। চা-সিঙ্গাড়ার দিকে মনোযোগ কম দিয়ে আবেগ ঘন করতে হবে।'
                  : 'Never surrender the microphone under 90 minutes. Promises of galactic progress must always precede snacks.'}
              </p>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* ZONE 6: DATABASE ARTICLES ARCHIVE (IF ANY) */}
        {/* ------------------------------------------------------------ */}
        {Object.keys(categoryArticles).length > 0 && (
          <section className="mt-8 space-y-12">
            <div className="border-b-2 border-stone-200 pb-2 mb-4">
              <h2 className="text-xl md:text-2xl font-bold font-serif text-stone-900">
                {isBn ? 'অন্যান্য খবর ও বিশ্লেষণ' : 'Other Desks & Reports'}
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
                      className="group bg-white p-3 rounded-lg border border-stone-200 hover:border-red-300 transition shadow-sm hover:shadow"
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
