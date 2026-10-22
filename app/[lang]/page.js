'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Sparkles,
  ArrowUpRight,
  Clock,
  Layers,
  Cpu,
  RefreshCw,
  Check,
  BookOpen,
  Feather,
  Compass,
  Send,
  MessageSquare,
  Quote,
  ChevronRight,
  Calendar,
  CloudSun,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { bn } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'
import { CURATED_FASHION_ARTICLES } from '@/lib/fashionArticles'
import {
  FICTITIOUS_EDITORIAL_TEAM,
  DOINIK_OBHIMOT_COLUMNS,
  DOINIK_OBHIMOT_DAILY_POLL,
  EDITORIAL_CONTACTS,
} from '@/lib/brandConfig'

// Helper for relative publishing times
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

// Witty Fashion-Tech cultural observations (relaxing, funny, meme-aware)
const FASHION_TECH_MEMES = [
  {
    bn: '“অফিসের এসি ২৩ ডিগ্রি সেলসিয়াস, অথচ ডেভেলপার পরে আছেন ১৪টি পকেটওয়ালা এভারেস্ট-গ্রেড ওয়াটারপ্রুফ টেকওয়্যার জ্যাকেট—কারণ ট্যাকটিক্যাল লুকই এখন প্রধান প্রায়োরিটি।”',
    en: '"Air conditioning is set to 23°C, yet the senior engineer is wearing a 14-pocket expedition-grade Gore-Tex shell to conquer the hallway coffee machine."',
    topic_bn: 'আরবান টেকওয়্যার সিন্ড্রোম',
    topic_en: 'Urban Techwear Syndrome',
  },
  {
    bn: '“আঙুলের $৪০০ মূল্যের সিরামিক স্মার্ট রিং যখন হালকা কেঁপে নোটিফিকেশন পাঠায়: ‘আপনি কি ফ্যাশন উইকের ফ্রন্ট-রো টিকিট কাটতে গিয়ে অতিরিক্ত চিন্তিত?’—”',
    en: '"When your $400 titanium smart ring buzzes to warn you that your heart rate spiked right as the runway tickets went on sale."',
    topic_bn: 'বায়োমেট্রিক প্যারাডক্স',
    topic_en: 'Biometric Paradox',
  },
  {
    bn: '“সিলিকন ভ্যালির নেভি ব্লু ফ্লিস ভেস্টের দিন শেষ; টোকিও ও প্যারিস রানওয়ের নতুন ট্রেন্ড: অপটিক-ফাইবার বুননের সাইবার-ট্রেঞ্চ কোট।”',
    en: '"The era of corporate fleece vests is officially over; welcome to optic-fiber luminescent trench coats engineered for digital nomads."',
    topic_bn: 'সিলিকন বনাম রানওয়ে',
    topic_en: 'Silicon vs. Runway',
  },
  {
    bn: '“স্মার্ট সানগ্লাস দিয়ে গান শুনছেন, কিন্তু বন্ধুদের বলছেন: ‘না না, আমি তো তোমাদের কথাই গভীর মনোযোগ দিয়ে শুনছি!’”',
    en: '"Wearing bone-conduction audio frames while nodding thoughtfully in design meetings like you actually heard the brief."',
    topic_bn: 'অডিও ফ্রেম রসবোধ',
    topic_en: 'Audio Frame Etiquette',
  },
]

export default function Home({ params: { lang } }) {
  const isBn = lang === 'bn'

  const [articles, setArticles] = useState(CURATED_FASHION_ARTICLES)
  const [loading, setLoading] = useState(true)
  const [memeIndex, setMemeIndex] = useState(0)
  const [pollVotes, setPollVotes] = useState(DOINIK_OBHIMOT_DAILY_POLL.options)
  const [userVotedOption, setUserVotedOption] = useState(null)
  const [userComment, setUserComment] = useState('')
  const [submittedComment, setSubmittedComment] = useState(null)

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(12)

      if (!error && Array.isArray(data) && data.length > 0) {
        const map = new Map()
        CURATED_FASHION_ARTICLES.forEach((item) => map.set(item.id, item))
        data.forEach((item) => map.set(item.id, item))
        setArticles(Array.from(map.values()))
      } else {
        setArticles(CURATED_FASHION_ARTICLES)
      }
    } catch (err) {
      console.warn('Error fetching articles:', err)
      setArticles(CURATED_FASHION_ARTICLES)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  const getTitle = useCallback(
    (a) => (isBn && a.title_bn ? a.title_bn : a.title),
    [isBn]
  )

  const getExcerpt = useCallback(
    (a) => (isBn && a.excerpt_bn ? a.excerpt_bn : a.excerpt || ''),
    [isBn]
  )

  // Categorized Article Slices
  const heroArticle = articles[0] || CURATED_FASHION_ARTICLES[0]
  const sideEditorialBriefs = articles.slice(1, 4)
  const fashionTechFeatures = articles.slice(2, 5)
  const satireArticles = articles.slice(4, 7)

  const handleNextMeme = () => {
    setMemeIndex((prev) => (prev + 1) % FASHION_TECH_MEMES.length)
  }

  const handleVotePoll = (optionId) => {
    if (userVotedOption) return
    setUserVotedOption(optionId)
    setPollVotes((prev) => {
      const total = prev.reduce((acc, curr) => acc + curr.votes, 0) + 1
      return prev.map((opt) => {
        const count = opt.id === optionId ? opt.votes + 1 : opt.votes
        return {
          ...opt,
          votes: count,
          percent: Math.round((count / total) * 100),
        }
      })
    })
  }

  const handleSubmitComment = (e) => {
    e.preventDefault()
    if (!userComment.trim()) return
    setSubmittedComment(userComment.trim())
    setUserComment('')
  }

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-stone-900 font-sans pb-24">
      {/* ======================================================== */}
      {/* 1. BROADSHEET MASTHEAD & EDITION BANNER */}
      {/* ======================================================== */}
      <section className="border-b border-stone-200/80 bg-[#F5F2EB]/60">
        <div className="container-custom max-w-screen-xl py-2.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between text-xs text-stone-600 gap-2">
            
            {/* Bengali & Gregorian Calendar Date */}
            <div className="flex items-center gap-3 text-[11px] md:text-xs">
              <span className="flex items-center gap-1.5 font-medium text-stone-700">
                <Calendar size={13} className="text-teal-800" />
                <span>
                  {isBn
                    ? 'বৃহস্পতিবার, কার্তিক ১৪৩১ বঙ্গাব্দ · ঢাকা সংস্করণ'
                    : 'Thursday, October · Dhaka & Global Editions'}
                </span>
              </span>
              <span className="text-stone-300">|</span>
              <span className="flex items-center gap-1.5 text-stone-500">
                <CloudSun size={13} className="text-amber-700" />
                <span>{isBn ? 'ঢাকা ২৮° সে. · শান্ত আবহাওয়া' : 'Dhaka 28°C · Fair'}</span>
              </span>
            </div>

            {/* Publication Motto & Issue Marker */}
            <div className="flex items-center gap-3 text-[11px]">
              <span className="italic text-stone-500 font-serif">
                {isBn
                  ? '“মুক্তচিন্তা, আধুনিক রুচি ও প্রযুক্তির স্বাধীন প্রকাশ”'
                  : '“Independent Perspectives on Style, Culture & Innovation”'}
              </span>
              <span className="text-stone-300 hidden sm:inline">|</span>
              <span className="font-mono text-stone-600 bg-white/70 px-2 py-0.5 rounded border border-stone-200/60 hidden sm:inline">
                ISSN 2958-812X · VOL. IV
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="container-custom max-w-screen-xl pt-6 md:pt-8 space-y-14">

        {/* ======================================================== */}
        {/* 2. THE BRAND TITLE & EDITORIAL HEADER */}
        {/* ======================================================== */}
        <div className="border-b-2 border-stone-900 pb-5 pt-2">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-teal-900 bg-teal-50 border border-teal-200/80 px-2.5 py-0.5 rounded">
                  {isBn ? 'দৈনিক সম্পাদকীয় ও সংকলন' : 'Daily Editorial Broadsheet'}
                </span>
                <span className="text-stone-300">·</span>
                <span className="text-xs text-stone-500 font-medium font-serif">
                  {isBn ? 'ফ্যাশন · প্রযুক্তি · সমকালীন মতামত' : 'Style · Tech · Perspectives'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight text-stone-900 leading-tight">
                {isBn ? 'দৈনিক অভিমত' : 'Doinik Obhimot'}
                <span className="text-stone-400 font-serif font-light text-2xl md:text-3xl ml-3">
                  — {isBn ? 'Doinik Obhimot' : 'দৈনিক অভিমত'}
                </span>
              </h1>
              
              <p className="text-xs sm:text-sm text-stone-600 max-w-2xl font-serif">
                {isBn
                  ? 'আবহমান বাংলার ঐতিহ্য, সমকালীন রুচিবোধ, পরিধেয় উদ্ভাবন ও বুদ্ধিবৃত্তিক ভাবনার মেলবন্ধন।'
                  : 'A distinguished daily journal curating thoughtful perspectives on luxury craft, wearable computing, and contemporary culture.'}
              </p>
            </div>

            {/* Editorial Staff Signature Badge */}
            <div className="flex flex-col items-start md:items-end text-xs text-stone-600 shrink-0">
              <div className="flex items-center gap-2 bg-white border border-stone-200 px-3.5 py-2 rounded-lg shadow-2xs">
                <Feather size={14} className="text-teal-800" />
                <span className="font-serif font-medium text-stone-800">
                  {isBn
                    ? `${FICTITIOUS_EDITORIAL_TEAM.editorInChief.title_bn}: ${FICTITIOUS_EDITORIAL_TEAM.editorInChief.name_bn}`
                    : `${FICTITIOUS_EDITORIAL_TEAM.editorInChief.title_en}: ${FICTITIOUS_EDITORIAL_TEAM.editorInChief.name_en}`}
                </span>
              </div>
              <span className="text-[10px] text-stone-400 font-mono mt-1">
                {isBn ? 'গুলশান এভিনিউ, ঢাকা থেকে প্রকাশিত' : 'Published from Gulshan Avenue, Dhaka'}
              </span>
            </div>

          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. HERO FRONT-PAGE LEAD EDITORIAL (CENTERPIECE + SIDE BRIEFS) */}
        {/* ======================================================== */}
        <section className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-teal-900 flex items-center gap-2">
              <BookOpen size={14} className="text-teal-800" />
              <span>{isBn ? 'আজকের প্রধান সম্পাদকীয় ও দৃষ্টিকোণ' : 'Lead Opinion & Frontpage Editorial'}</span>
            </h2>
            <span className="text-xs text-stone-400 font-serif italic">
              {isBn ? 'প্রধান সম্পাদকের কলাম' : 'Editor’s Note'}
            </span>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Primary Lead Editorial (8 Columns) */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-sm transition group">
              <Link href={`/${lang}/article/${heroArticle.id}`} className="block">
                <div className="relative aspect-[16/9] w-full bg-stone-100 overflow-hidden">
                  <Image
                    src={heroArticle.featured_image || '/images/fashiontech/hero.jpg'}
                    alt={getTitle(heroArticle)}
                    fill
                    priority
                    className="object-cover group-hover:scale-102 transition duration-700 ease-out"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                  <div className="absolute top-4 left-4 bg-stone-900/90 backdrop-blur-xs text-white px-3 py-1 rounded text-xs font-mono font-medium tracking-wide">
                    {isBn ? 'আজকের প্রধান সম্পাদকীয়' : 'LEAD EDITORIAL'}
                  </div>
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-xs text-stone-800 px-2.5 py-1 rounded text-xs font-serif font-medium">
                    {isBn ? '৭ মিনিট পাঠ' : '7 min read'}
                  </div>
                </div>

                <div className="p-6 md:p-8 space-y-4">
                  <div className="flex items-center gap-2 text-xs text-stone-500 font-mono">
                    <span className="text-teal-800 font-semibold uppercase tracking-wider">
                      {heroArticle.category}
                    </span>
                    <span>·</span>
                    <span>{getRelativeTime(heroArticle.published_at, lang)}</span>
                    <span>·</span>
                    <span className="text-stone-400">{heroArticle.views} {isBn ? 'পাঠক' : 'reads'}</span>
                  </div>

                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-stone-900 group-hover:text-teal-900 transition leading-snug">
                    {getTitle(heroArticle)}
                  </h3>

                  <p className="text-stone-600 text-sm md:text-base leading-relaxed line-clamp-3 font-serif">
                    {getExcerpt(heroArticle)}
                  </p>

                  {/* Pull quote style excerpt */}
                  <div className="p-4 bg-stone-50 border-l-2 border-teal-800 rounded-r-lg my-3">
                    <p className="text-xs md:text-sm font-serif italic text-stone-700 leading-relaxed">
                      {isBn
                        ? '“রুচিবোধ কোনো ক্ষণস্থায়ী ফ্যাশন নয়; তা হলো নিজের চিন্তাকে সুন্দর ও দায়িত্বশীলভাবে উপস্থাপন করার শিল্প।”'
                        : '“Style is not mere ornamentation; it is the quiet architecture of human intent and cultural expression.”'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-teal-100 text-teal-900 flex items-center justify-center font-serif font-bold text-xs">
                        ই
                      </span>
                      <span className="font-medium text-stone-800">{heroArticle.author}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 font-semibold text-teal-800 group-hover:translate-x-1 transition">
                      <span>{isBn ? 'সম্পূর্ণ সম্পাদকীয় পড়ুন' : 'Read Full Editorial'}</span>
                      <ArrowUpRight size={15} />
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Editorial Desk Side Highlights (4 Columns) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-stone-100/60 border border-stone-200/80 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                    <Compass size={14} className="text-teal-800" />
                    {isBn ? 'সম্পাদকীয় টীকা ও দ্রুত পাঠ' : 'Editorial Highlights'}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {isBn ? 'সংক্ষিপ্ত নিবন্ধ' : 'Quick Takes'}
                  </span>
                </div>

                <div className="space-y-4 divide-y divide-stone-200/70">
                  {sideEditorialBriefs.map((article, idx) => (
                    <Link
                      key={article.id}
                      href={`/${lang}/article/${article.id}`}
                      className="group block pt-3 first:pt-0"
                    >
                      <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono mb-1">
                        <span className="text-teal-800 font-medium">{article.category}</span>
                        <span>{getRelativeTime(article.published_at, lang)}</span>
                      </div>
                      <h4 className="font-serif font-bold text-sm text-stone-900 group-hover:text-teal-800 transition line-clamp-2 leading-snug">
                        {getTitle(article)}
                      </h4>
                      <p className="text-stone-500 text-xs line-clamp-2 mt-1 leading-relaxed">
                        {getExcerpt(article)}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-stone-400 mt-2">
                        <span className="truncate max-w-[150px]">{article.author.split('·')[0]}</span>
                        <span className="text-teal-800 font-medium group-hover:translate-x-0.5 transition inline-flex items-center gap-0.5">
                          {isBn ? 'পড়ুন' : 'Read'} <ChevronRight size={12} />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Newspaper Quote Box */}
              <div className="bg-white border border-stone-200/90 rounded-2xl p-5 text-stone-800 space-y-2">
                <Quote size={20} className="text-teal-800/60" />
                <p className="font-serif italic text-xs leading-relaxed text-stone-700">
                  {isBn
                    ? '“দৈনিক অভিমতের পাতায় আমরা কেবল প্রযুক্তির চাকা দেখি না, দেখি তা মানুষের প্রাত্যহিক অনুভূতি ও রুচির ওপর কেমন প্রভাব ফেলছে।”'
                    : '“In the pages of Doinik Obhimot, we do not merely measure the gears of technology; we contemplate how they shape human sensibilities.”'}
                </p>
                <span className="block text-[11px] font-mono text-stone-500 pt-1">
                  — {isBn ? 'সম্পাদকীয় প্যানেল, দৈনিক অভিমত' : 'Editorial Board, Doinik Obhimot'}
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* ======================================================== */}
        {/* 4. OPINION COLUMNISTS ROSTER (মতামত স্তম্ভ ও কলামিস্ট) */}
        {/* ======================================================== */}
        <section className="space-y-6 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-200">
            <div>
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-teal-900 flex items-center gap-2">
                <Feather size={15} className="text-teal-800" />
                <span>{isBn ? 'মতামত স্তম্ভ ও নিয়মিত কলামিস্ট' : 'Featured Opinion Columnists'}</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5 font-serif">
                {isBn
                  ? 'বিশিষ্ট চিন্তাবিদ, গবেষক ও ফ্যাশন-টেক বিশ্লেষকদের নিয়মিত কলাম'
                  : 'Regular columns by renowned thinkers, material scientists, and cultural critics'}
              </p>
            </div>
            <span className="text-xs font-mono text-stone-500 bg-stone-100 px-2.5 py-1 rounded">
              {DOINIK_OBHIMOT_COLUMNS.length} {isBn ? 'টি মতামত কলাম' : 'Columns Active'}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {DOINIK_OBHIMOT_COLUMNS.map((col) => (
              <Link
                key={col.id}
                href={`/${lang}/article/${col.article_id}`}
                className="group flex flex-col justify-between p-5 bg-white rounded-2xl border border-stone-200/90 hover:border-stone-300 shadow-2xs hover:shadow-xs transition duration-200 space-y-4"
              >
                <div className="space-y-3">
                  {/* Columnist info header */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-teal-900 font-serif font-bold text-sm shrink-0">
                      {isBn ? col.author_bn.charAt(0) : col.author_en.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-sm text-stone-900 group-hover:text-teal-800 transition">
                        {isBn ? col.author_bn : col.author_en}
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        {isBn ? col.role_bn : col.role_en}
                      </p>
                    </div>
                  </div>

                  {/* Column Series Name */}
                  <div className="pt-2 border-t border-stone-100">
                    <span className="text-[10px] font-mono font-bold uppercase text-teal-800 tracking-wider">
                      {isBn ? `কলাম: ${col.column_title_bn}` : `Column: ${col.column_title_en}`}
                    </span>
                    <p className="font-serif italic text-xs text-stone-700 mt-1 leading-relaxed">
                      {isBn ? col.quote_bn : col.quote_en}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400 font-mono">
                  <span>{isBn ? col.read_time_bn : col.read_time_en}</span>
                  <span className="text-teal-800 font-sans font-semibold group-hover:translate-x-1 transition inline-flex items-center gap-1">
                    <span>{isBn ? 'কলাম পড়ুন' : 'Read Column'}</span>
                    <ArrowUpRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ======================================================== */}
        {/* 5. EDITORIAL SECTIONS: SMART FASHION & BENGAL HERITAGE */}
        {/* ======================================================== */}
        <section className="space-y-6 pt-2">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <div>
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-teal-900 flex items-center gap-2">
                <Cpu size={15} className="text-teal-800" />
                <span>{isBn ? 'ফ্যাশন-টেক ও ঐতিহ্যের রূপান্তর' : 'Fashion Innovation & Heritage Wefts'}</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5 font-serif">
                {isBn
                  ? 'জামদানির বুনন থেকে সিলিকনের ন্যানোটিউব: পোশাকের নতুন দিগন্ত'
                  : 'From Bengal handloom heritage to biometric membranes and cyber couture'}
              </p>
            </div>
            <Link
              href={`/${lang}/category/smart-fashion`}
              className="text-xs text-teal-800 font-medium hover:underline inline-flex items-center gap-1"
            >
              <span>{isBn ? 'সব দেখুন' : 'Explore All'}</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {fashionTechFeatures.map((article) => (
              <Link
                key={article.id}
                href={`/${lang}/article/${article.id}`}
                className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-stone-200/90 hover:border-stone-300 shadow-2xs hover:shadow-xs transition duration-200"
              >
                <div className="relative aspect-[16/10] w-full bg-stone-100 overflow-hidden">
                  <Image
                    src={article.featured_image || '/images/fashiontech/wearables.jpg'}
                    alt={getTitle(article)}
                    fill
                    className="object-cover group-hover:scale-104 transition duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-xs text-stone-800 px-2 py-0.5 rounded text-[11px] font-mono font-medium">
                    {article.category}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-serif font-bold text-base text-stone-900 group-hover:text-teal-800 transition line-clamp-2 leading-snug">
                      {getTitle(article)}
                    </h3>
                    <p className="text-stone-600 text-xs leading-relaxed line-clamp-3 font-serif">
                      {getExcerpt(article)}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                    <span className="truncate max-w-[140px]">{article.author.split('·')[0]}</span>
                    <span className="inline-flex items-center gap-1 text-teal-800 font-medium">
                      <span>{isBn ? 'সম্পূর্ণ পাঠ' : 'Read'}</span>
                      <ArrowUpRight size={13} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ======================================================== */}
        {/* 6. SATIRE, MEMES & WITTY CULTURE (দ্য মিম রানওয়ে ও স্যাটায়ার) */}
        {/* ======================================================== */}
        <section className="bg-stone-100/70 border border-stone-200/90 rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-teal-100 text-teal-900 rounded-lg">
                <Sparkles size={16} />
              </span>
              <div>
                <h2 className="text-base font-serif font-bold text-stone-900">
                  {isBn ? 'দ্য মিম রানওয়ে: চায়ের টেবিলে ফ্যাশন-টেক রসবোধ' : 'The Meme Runway: Witty Style & Tech Takes'}
                </h2>
                <p className="text-xs text-stone-500">
                  {isBn
                    ? 'স্মার্ট গ্যাজেট আর ফ্যাশন ট্রেন্ডসের মজার পর্যবেক্ষণ, সমকালীন স্যাটায়ার ও হালকা রসবোধ'
                    : 'A lighthearted commentary on gadgets, techwear obsessions, and runway absurdities'}
                </p>
              </div>
            </div>

            {/* Cycler button */}
            <button
              onClick={handleNextMeme}
              className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-stone-700 hover:text-stone-900 border border-stone-200 rounded-lg shadow-2xs hover:bg-stone-50 transition"
            >
              <RefreshCw size={13} className="text-teal-700" />
              <span>{isBn ? 'পরবর্তী রসবোধ' : 'Next Take'}</span>
            </button>
          </div>

          {/* Interactive Witty Quote Box */}
          <div className="bg-white p-5 rounded-xl border border-stone-200/90 shadow-2xs">
            <div className="text-xs font-mono font-semibold text-teal-800 uppercase tracking-wider mb-2">
              # {isBn ? FASHION_TECH_MEMES[memeIndex].topic_bn : FASHION_TECH_MEMES[memeIndex].topic_en}
            </div>
            <p className="font-serif italic text-base md:text-lg text-stone-800 leading-relaxed">
              {isBn ? FASHION_TECH_MEMES[memeIndex].bn : FASHION_TECH_MEMES[memeIndex].en}
            </p>
          </div>

          {/* Satire Stories Grid */}
          <div className="grid md:grid-cols-2 gap-6 pt-2">
            {satireArticles.map((article) => (
              <Link
                key={article.id}
                href={`/${lang}/article/${article.id}`}
                className="group flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-xl border border-stone-200/80 hover:border-stone-300 shadow-2xs transition"
              >
                <div className="relative w-full sm:w-36 h-32 shrink-0 bg-stone-100 rounded-lg overflow-hidden">
                  <Image
                    src={article.featured_image || '/images/fashion/streetwear.jpg'}
                    alt={getTitle(article)}
                    fill
                    className="object-cover group-hover:scale-104 transition duration-300"
                    sizes="(max-width: 640px) 100vw, 150px"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-teal-800 uppercase">
                      {article.category}
                    </span>
                    <h4 className="font-serif font-bold text-sm text-stone-900 group-hover:text-teal-800 transition line-clamp-2 mt-1">
                      {getTitle(article)}
                    </h4>
                    <p className="text-stone-500 text-xs line-clamp-2 mt-1 font-serif">
                      {getExcerpt(article)}
                    </p>
                  </div>
                  <div className="text-[11px] text-stone-400 flex items-center justify-between pt-1">
                    <span>{article.author.split('·')[0]}</span>
                    <span className="text-teal-800 font-semibold group-hover:translate-x-0.5 transition">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ======================================================== */}
        {/* 7. DAILY READER OPINION POLL & VOICES (আজকের পাঠক সমীক্ষা ও খোলামত) */}
        {/* ======================================================== */}
        <section className="bg-white border border-stone-200/90 rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200/70 px-2 py-0.5 rounded uppercase">
                  {isBn ? DOINIK_OBHIMOT_DAILY_POLL.date_label_bn : DOINIK_OBHIMOT_DAILY_POLL.date_label_en}
                </span>
              </div>
              <h3 className="font-serif font-bold text-lg text-stone-900 mt-1">
                {isBn ? DOINIK_OBHIMOT_DAILY_POLL.question_bn : DOINIK_OBHIMOT_DAILY_POLL.question_en}
              </h3>
            </div>
            <span className="text-xs font-mono text-stone-400">
              {DOINIK_OBHIMOT_DAILY_POLL.total_votes} {isBn ? 'জন পাঠক ভোট দিয়েছেন' : 'reader votes'}
            </span>
          </div>

          <div className="grid md:grid-cols-12 gap-8 items-start">
            
            {/* Poll voting options (7 cols) */}
            <div className="md:col-span-7 space-y-3">
              <p className="text-xs text-stone-500 font-serif">
                {userVotedOption
                  ? isBn
                    ? 'আপনার মতামত রেকর্ড করা হয়েছে। সামগ্রিক ফলাফল নিচে প্রদর্শিত হচ্ছে:'
                    : 'Your opinion has been recorded. Current aggregated percentages:'
                  : isBn
                  ? 'আপনার পছন্দের উত্তরে ক্লিক করে সরাসরি ভোট দিন:'
                  : 'Click your answer below to vote:'}
              </p>

              <div className="space-y-2.5">
                {pollVotes.map((opt) => {
                  const isChosen = userVotedOption === opt.id
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleVotePoll(opt.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition relative overflow-hidden ${
                        isChosen
                          ? 'border-teal-500 bg-teal-50/60 ring-1 ring-teal-500/30'
                          : 'border-stone-200 hover:border-stone-300 bg-stone-50/50 hover:bg-stone-50'
                      }`}
                    >
                      {/* Percent progress bar background */}
                      {userVotedOption && (
                        <div
                          className="absolute inset-y-0 left-0 bg-teal-100/50 transition-all duration-700 pointer-events-none"
                          style={{ width: `${opt.percent}%` }}
                        />
                      )}

                      <div className="relative z-10 flex items-center justify-between gap-4">
                        <span className="text-xs md:text-sm text-stone-800 font-serif">
                          {isBn ? opt.label_bn : opt.label_en}
                        </span>
                        {userVotedOption && (
                          <span className="text-xs font-mono font-bold text-teal-900 shrink-0">
                            {opt.percent}%
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Reader Letter / Quick comment box (5 cols) */}
            <div className="md:col-span-5 bg-stone-50/80 p-5 rounded-xl border border-stone-200/80 space-y-3">
              <div className="flex items-center gap-2 text-stone-800 text-xs font-bold uppercase tracking-wider font-mono">
                <MessageSquare size={14} className="text-teal-800" />
                <span>{isBn ? 'খোলামত: আপনার সংক্ষিপ্ত ভাবনা' : 'Submit Reader Perspective'}</span>
              </div>

              {submittedComment ? (
                <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-lg space-y-1">
                  <span className="text-[11px] font-bold text-teal-900 flex items-center gap-1">
                    <Check size={13} />
                    {isBn ? 'অভিমত গৃহীত হয়েছে!' : 'Perspective Received!'}
                  </span>
                  <p className="text-xs italic text-teal-800 font-serif">
                    “{submittedComment}”
                  </p>
                  <span className="text-[10px] text-teal-700 block pt-1">
                    {isBn ? 'সম্পাদনা প্যানেল যাচাইয়ের পর এটি সংকলনে যুক্ত হতে পারে।' : 'May be selected for tomorrow’s reader edition.'}
                  </span>
                </div>
              ) : (
                <form onSubmit={handleSubmitComment} className="space-y-2.5">
                  <textarea
                    rows={3}
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    placeholder={
                      isBn
                        ? 'এই বিষয়ে আপনার এক লাইনের নিজস্ব মতামত লিখুন...'
                        : 'Write your 1-line perspective on modern wearables...'
                    }
                    className="w-full text-xs p-2.5 rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-1 focus:ring-teal-700 text-stone-800 placeholder-stone-400"
                  />
                  <button
                    type="submit"
                    disabled={!userComment.trim()}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium bg-stone-900 text-white rounded-lg hover:bg-teal-900 transition disabled:opacity-50"
                  >
                    <Send size={12} />
                    <span>{isBn ? 'অভিমত জমা দিন' : 'Submit Perspective'}</span>
                  </button>
                </form>
              )}
            </div>

          </div>
        </section>

        {/* ======================================================== */}
        {/* 8. EDITORIAL CREDO & BRAND PHILOSOPHY BOX */}
        {/* ======================================================== */}
        <section className="bg-[#FAF8F5] border border-stone-300/80 rounded-2xl p-6 md:p-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <span className="text-[10px] font-mono uppercase font-bold text-teal-900 tracking-wider">
                {isBn ? 'সম্পাদকীয় নীতিমালা ও ঘোষণাপত্র' : 'Editorial Mission & Credo'}
              </span>
              <h3 className="text-lg md:text-xl font-serif font-bold text-stone-900">
                {isBn
                  ? 'দৈনিক অভিমত: চিন্তা, সৌন্দর্য ও প্রযুক্তির নির্ভীক প্রকাশ'
                  : 'Doinik Obhimot: Crafting Calm in an Age of Frantic Feeds'}
              </h3>
              <p className="text-xs md:text-sm text-stone-600 leading-relaxed font-serif">
                {isBn
                  ? 'দৈনিক অভিমত (Doinik Obhimot) একটি স্বাধীন দ্বিভাষিক সম্পাদকীয় ও ফ্যাশন-টেক প্রকাশনা। আমাদের লক্ষ্য অবিরাম কোলাহল এড়িয়ে গভীর পাঠ, টেকসই রুচিবোধ এবং পরিধেয় উদ্ভাবনের সচেতন মেলবন্ধন গড়ে তোলা। এখানে কোনো বিজ্ঞাপনসুলভ অতিশয়োক্তি নেই—আছে কেবল মুক্তচিন্তা এবং রুচিশীল জীবনের দিকনির্দেশনা।'
                  : 'Doinik Obhimot is an independent bilingual editorial broadsheet published in Dhaka. We believe that technology and fashion reach their zenith when disciplined by quiet craftsmanship, ethical production, and conscious restraint.'}
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
