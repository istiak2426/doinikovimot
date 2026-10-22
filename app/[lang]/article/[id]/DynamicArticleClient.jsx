'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Calendar,
  Eye,
  ArrowLeft,
  Heart,
  Share2,
  Bookmark,
  MessageSquare,
  Clock,
  Check,
  Volume2,
  Play,
  Pause,
  Printer,
  Feather,
  Quote,
  BookOpen,
} from 'lucide-react'
import { format } from 'date-fns'
import { bn } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'
import { CURATED_FASHION_ARTICLES } from '@/lib/fashionArticles'
import { FICTITIOUS_EDITORIAL_TEAM, EDITORIAL_CONTACTS } from '@/lib/brandConfig'
import LoadingSpinner from '@/components/LoadingSpinner'

// Toast notification component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full shadow-lg text-xs md:text-sm font-medium flex items-center gap-2 border animate-in fade-in slide-in-from-bottom-2 duration-300 ${
        type === 'success'
          ? 'bg-teal-900 text-teal-50 border-teal-700'
          : 'bg-stone-900 text-stone-100 border-stone-700'
      }`}
    >
      <Check size={14} className="text-teal-300" />
      <span>{message}</span>
    </div>
  )
}

export default function DynamicArticleClient({ initialArticle }) {
  const params = useParams()
  const id = params?.id
  const lang = params?.lang || 'bn'
  const isBn = lang === 'bn'

  const [article, setArticle] = useState(initialArticle || null)
  const [loading, setLoading] = useState(!initialArticle)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(initialArticle?.likes || 48)
  const [bookmarked, setBookmarked] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [readingProgress, setReadingProgress] = useState(0)
  const [toast, setToast] = useState(null)
  const [copied, setCopied] = useState(false)

  // Reading atmosphere & font controls
  const [fontSize, setFontSize] = useState('base') // 'base' | 'lg' | 'xl'
  const [readingTheme, setReadingTheme] = useState('paper') // 'paper' | 'sepia' | 'dark'

  // Audio listen simulation
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)

  // Reader comments
  const [comments, setComments] = useState([
    {
      id: 1,
      author: isBn ? 'ফারহানা ইসলাম' : 'Farhana Islam',
      role: isBn ? 'ডিজাইন গবেষক' : 'Design Researcher',
      date: isBn ? '২ ঘণ্টা আগে' : '2 hours ago',
      text: isBn
        ? 'দৈনিক অভিমতের সম্পাদকীয় বিশ্লেষণটি অসাধারণ হয়েছে। বিশেষ করে প্রযুক্তির অপ্রয়োজনীয় তাড়াহুড়ো বাদ দিয়ে দীর্ঘস্থায়ী নান্দনিকতার ওপর জোর দেওয়াটা বর্তমান সময়ে খুবই দরকারি।'
        : 'A profound editorial piece. Championing quiet, enduring craft over frantic notification noise resonates deeply with contemporary designers.',
    },
    {
      id: 2,
      author: isBn ? 'তানভীর মাহমুদ' : 'Tanvir Mahmud',
      role: isBn ? 'টেক আর্কিটেক্ট' : 'Tech Architect',
      date: isBn ? '৪ ঘণ্টা আগে' : '4 hours ago',
      text: isBn
        ? 'বাংলার জামদানি নকশায় অপটিক্যাল ফাইবারের সংযোজন বিশ্বমঞ্চে আমাদের সংস্কৃতিকে এক অনন্য উচ্চতায় নিয়ে যাবে।'
        : 'The synthesis of Sonargaon handloom wefts and conductive silk filaments is a masterclass in modern material science.',
    },
  ])
  const [newCommentName, setNewCommentName] = useState('')
  const [newCommentText, setNewCommentText] = useState('')

  const articleRef = useRef(null)

  // Scroll reading progress
  useEffect(() => {
    const handleScroll = () => {
      if (!articleRef.current) return
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100
      setReadingProgress(Math.min(100, Math.max(0, progress)))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Local storage restore
  useEffect(() => {
    if (!id) return
    try {
      if (localStorage.getItem(`liked_${id}`)) setLiked(true)
      if (localStorage.getItem(`bookmarked_${id}`)) setBookmarked(true)
      const savedTheme = localStorage.getItem('obhimot_reader_theme')
      if (savedTheme) setReadingTheme(savedTheme)
      const savedFontSize = localStorage.getItem('obhimot_reader_font')
      if (savedFontSize) setFontSize(savedFontSize)
    } catch {
      // ignore
    }
  }, [id])

  // Resolve article if not provided or initialArticle is incomplete
  useEffect(() => {
    if (article) return

    const foundCurated = CURATED_FASHION_ARTICLES.find(
      (a) => a.id === id || a.slug === id
    )
    if (foundCurated) {
      setArticle(foundCurated)
      setLoading(false)
      return
    }

    async function fetchDbArticle() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('id', id)
          .maybeSingle()
        if (!error && data) {
          setArticle(data)
          setLikesCount(data.likes || 24)
        } else {
          setArticle(CURATED_FASHION_ARTICLES[0])
        }
      } catch {
        setArticle(CURATED_FASHION_ARTICLES[0])
      } finally {
        setLoading(false)
      }
    }
    fetchDbArticle()
  }, [id, article])

  // Audio timer
  useEffect(() => {
    let interval = null
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsPlayingAudio(false)
            return 0
          }
          return prev + 1.2
        })
      }, 500)
    }
    return () => clearInterval(interval)
  }, [isPlayingAudio])

  const handleLike = async () => {
    if (liked) return
    const nextCount = (likesCount || 0) + 1
    setLikesCount(nextCount)
    setLiked(true)
    try {
      localStorage.setItem(`liked_${id}`, 'true')
      await supabase
        .from('articles')
        .update({ likes: nextCount })
        .eq('id', id)
    } catch {
      // fallback
    }
    setToast({
      message: isBn ? 'আপনার অভিমতের জন্য ধন্যবাদ!' : 'Thank you for your reaction!',
      type: 'success',
    })
  }

  const handleBookmark = () => {
    const next = !bookmarked
    setBookmarked(next)
    try {
      if (next) {
        localStorage.setItem(`bookmarked_${id}`, 'true')
        setToast({
          message: isBn ? 'নিবন্ধটি বুকমার্কে সংরক্ষিত হলো' : 'Article saved to reading list',
          type: 'success',
        })
      } else {
        localStorage.removeItem(`bookmarked_${id}`)
        setToast({
          message: isBn ? 'বুকমার্ক থেকে সরানো হলো' : 'Removed from bookmarks',
          type: 'info',
        })
      }
    } catch {
      // ignore
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setToast({
        message: isBn ? 'লিংক ক্লিপবোর্ডে কপি হয়েছে' : 'Link copied to clipboard',
        type: 'success',
      })
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setToast({
        message: isBn ? 'কপি করতে ব্যর্থ হয়েছে' : 'Failed to copy link',
        type: 'error',
      })
    }
  }

  const handleAddComment = (e) => {
    e.preventDefault()
    if (!newCommentText.trim()) return
    const newEntry = {
      id: Date.now(),
      author: newCommentName.trim() || (isBn ? 'সচেতন পাঠক' : 'Thoughtful Reader'),
      role: isBn ? 'পাঠক অভিমত' : 'Reader Voice',
      date: isBn ? 'এখনই' : 'Just now',
      text: newCommentText.trim(),
    }
    setComments([newEntry, ...comments])
    setNewCommentName('')
    setNewCommentText('')
    setToast({
      message: isBn ? 'আপনার মন্তব্য সফলভাবে যুক্ত হয়েছে' : 'Comment published successfully',
      type: 'success',
    })
  }

  const changeTheme = (newTheme) => {
    setReadingTheme(newTheme)
    try {
      localStorage.setItem('obhimot_reader_theme', newTheme)
    } catch {
      // ignore
    }
  }

  const changeFontSize = (newSize) => {
    setFontSize(newSize)
    try {
      localStorage.setItem('obhimot_reader_font', newSize)
    } catch {
      // ignore
    }
  }

  if (loading) return <LoadingSpinner />
  if (!article) return null

  const title = (isBn && article.title_bn) || article.title
  const content = (isBn && article.content_bn) || article.content
  const excerpt = (isBn && article.excerpt_bn) || article.excerpt
  const readingTime = content
    ? Math.ceil(content.replace(/<[^>]*>/g, '').split(/\s+/).length / 180)
    : 5

  const relatedArticles = CURATED_FASHION_ARTICLES.filter(
    (a) => a.id !== article.id
  ).slice(0, 3)

  const themeClasses = {
    paper: {
      bg: 'bg-[#FAF8F5]',
      card: 'bg-white border-stone-200/90 text-stone-900',
      prose: 'prose-stone text-stone-800',
      meta: 'text-stone-500',
      accent: 'text-teal-900',
      pullquote: 'bg-stone-50 border-teal-800 text-stone-800',
    },
    sepia: {
      bg: 'bg-[#F4EEDC]',
      card: 'bg-[#FAF5E8] border-[#E5DBBE] text-[#3E2E20]',
      prose: 'prose-amber text-[#3E2E20]',
      meta: 'text-[#7D6B58]',
      accent: 'text-[#6A3D1E]',
      pullquote: 'bg-[#EFE6CE] border-[#8D582A] text-[#3E2E20]',
    },
    dark: {
      bg: 'bg-[#141414]',
      card: 'bg-[#1C1C1E] border-stone-800 text-[#E4E4E7]',
      prose: 'prose-invert text-[#D4D4D8]',
      meta: 'text-stone-400',
      accent: 'text-teal-400',
      pullquote: 'bg-stone-900 border-teal-500 text-stone-200',
    },
  }[readingTheme] || {}

  const fontSizeClasses = {
    base: 'text-base leading-relaxed',
    lg: 'text-lg leading-loose',
    xl: 'text-xl leading-loose',
  }[fontSize]

  return (
    <div className={`${themeClasses.bg} min-h-screen transition-colors duration-300 pb-24 font-sans`}>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-stone-200/60 z-50">
        <div
          className="h-full bg-teal-800 transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Broadsheet Top Navigation Bar */}
      <div className="border-b border-stone-200/70 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container-custom max-w-screen-xl py-2.5 flex items-center justify-between">
          <Link
            href={`/${lang}`}
            className="flex items-center gap-2 text-xs md:text-sm font-medium text-stone-700 hover:text-teal-900 transition"
          >
            <ArrowLeft size={16} />
            <span className="font-serif">
              {isBn ? 'দৈনিক অভিমত হোমপেজে ফিরুন' : 'Back to Doinik Obhimot'}
            </span>
          </Link>

          {/* Reader Controls Toolbar */}
          <div className="flex items-center gap-2 md:gap-3 text-xs">
            {/* Font Sizer */}
            <div className="hidden sm:flex items-center gap-1 bg-stone-100 rounded-lg p-1 border border-stone-200/80">
              <span className="text-[10px] font-mono text-stone-400 px-1">Aa</span>
              <button
                onClick={() => changeFontSize('base')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                  fontSize === 'base'
                    ? 'bg-white text-stone-900 shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Normal Font"
              >
                16
              </button>
              <button
                onClick={() => changeFontSize('lg')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                  fontSize === 'lg'
                    ? 'bg-white text-stone-900 shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Large Font"
              >
                18
              </button>
              <button
                onClick={() => changeFontSize('xl')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                  fontSize === 'xl'
                    ? 'bg-white text-stone-900 shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Extra Large Font"
              >
                20
              </button>
            </div>

            {/* Atmosphere / Theme */}
            <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-1 border border-stone-200/80">
              <button
                onClick={() => changeTheme('paper')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
                  readingTheme === 'paper'
                    ? 'bg-white text-stone-900 shadow-2xs font-bold'
                    : 'text-stone-600'
                }`}
                title="Paper White"
              >
                {isBn ? 'স্বাভাবিক' : 'Paper'}
              </button>
              <button
                onClick={() => changeTheme('sepia')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
                  readingTheme === 'sepia'
                    ? 'bg-[#F4EEDC] text-[#3E2E20] shadow-2xs font-bold'
                    : 'text-stone-600'
                }`}
                title="Warm Sepia"
              >
                {isBn ? 'সেপিয়া' : 'Sepia'}
              </button>
              <button
                onClick={() => changeTheme('dark')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
                  readingTheme === 'dark'
                    ? 'bg-stone-900 text-stone-100 shadow-2xs font-bold'
                    : 'text-stone-600'
                }`}
                title="Dark Night"
              >
                {isBn ? 'রাত' : 'Dark'}
              </button>
            </div>

            {/* Print Button */}
            <button
              onClick={() => window.print()}
              className="p-1.5 rounded-lg border border-stone-200/80 bg-white hover:bg-stone-100 text-stone-700 transition"
              title="Print article"
              aria-label="Print"
            >
              <Printer size={15} />
            </button>

            {/* Bookmark Button */}
            <button
              onClick={handleBookmark}
              className={`p-1.5 rounded-lg border transition ${
                bookmarked
                  ? 'bg-teal-50 border-teal-300 text-teal-800'
                  : 'bg-white border-stone-200/80 text-stone-700 hover:bg-stone-100'
              }`}
              title="Bookmark article"
              aria-label="Bookmark"
            >
              <Bookmark size={15} className={bookmarked ? 'fill-teal-800' : ''} />
            </button>

            {/* Share Button */}
            <button
              onClick={() => setShareOpen(true)}
              className="p-1.5 rounded-lg border border-stone-200/80 bg-white hover:bg-stone-100 text-stone-700 transition"
              title="Share"
              aria-label="Share"
            >
              <Share2 size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <main className="container-custom max-w-screen-xl pt-8 md:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Left Social & Reaction Spine (Desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-28 flex flex-col items-center gap-4">
              <button
                onClick={handleLike}
                className={`p-3 rounded-full border shadow-xs transition hover:scale-105 flex flex-col items-center gap-1 ${
                  liked
                    ? 'bg-rose-50 border-rose-300 text-rose-600'
                    : 'bg-white border-stone-200 text-stone-600 hover:text-rose-600'
                }`}
                title="Like editorial"
              >
                <Heart size={20} className={liked ? 'fill-rose-600' : ''} />
                <span className="text-[11px] font-mono font-bold">{likesCount}</span>
              </button>

              <button
                onClick={handleBookmark}
                className={`p-3 rounded-full border shadow-xs transition hover:scale-105 ${
                  bookmarked
                    ? 'bg-teal-50 border-teal-300 text-teal-800'
                    : 'bg-white border-stone-200 text-stone-600 hover:text-teal-800'
                }`}
                title="Save to bookmarks"
              >
                <Bookmark size={20} className={bookmarked ? 'fill-teal-800' : ''} />
              </button>

              <button
                onClick={handleCopyLink}
                className="p-3 bg-white border border-stone-200 rounded-full shadow-xs text-stone-600 hover:text-teal-800 hover:scale-105 transition"
                title="Copy share link"
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>

          {/* Primary Editorial Centerpiece (8 Cols) */}
          <article className="lg:col-span-8 space-y-6" ref={articleRef}>
            <div className={`${themeClasses.card} rounded-2xl border p-6 sm:p-8 md:p-10 shadow-xs space-y-6`}>
              
              {/* Category, Date & Read Time */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-100 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-teal-50 text-teal-900 border border-teal-200/80 font-bold uppercase tracking-wider text-[11px]">
                    {article.category || (isBn ? 'সম্পাদকীয়' : 'Editorial')}
                  </span>
                  <span className="text-stone-300">·</span>
                  <span className={themeClasses.meta}>
                    {article.published_at
                      ? format(new Date(article.published_at), 'PPP', {
                          locale: isBn ? bn : undefined,
                        })
                      : (isBn ? 'অক্টোবর ২০২৬' : 'October 2026')}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-stone-500">
                  <span className="flex items-center gap-1">
                    <Clock size={13} />
                    <span>{readingTime} {isBn ? 'মিনিট পাঠ' : 'min read'}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye size={13} />
                    <span>{article.views?.toLocaleString() || '4,280'} {isBn ? 'বার পঠিত' : 'reads'}</span>
                  </span>
                </div>
              </div>

              {/* Broadsheet Headline */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-serif font-black tracking-tight leading-snug">
                {title}
              </h1>

              {/* Author Attribution Bar */}
              <div className="flex items-center justify-between pt-1 pb-4 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-900 flex items-center justify-center font-serif font-bold text-base border border-teal-200/80">
                    {article.author ? article.author.charAt(0) : 'দ'}
                  </div>
                  <div>
                    <div className="font-serif font-bold text-sm text-stone-900">
                      {article.author || (isBn ? 'দৈনিক অভিমত সম্পাদকীয় প্যানেল' : 'Doinik Obhimot Editorial Desk')}
                    </div>
                    <div className="text-[11px] text-stone-500 font-mono">
                      {isBn ? 'বিশেষ মতামত ও কলাম' : 'Special Editorial Column'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                    isPlayingAudio
                      ? 'bg-teal-900 text-white border-teal-900'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {isPlayingAudio ? <Pause size={14} /> : <Play size={14} className="fill-stone-700" />}
                  <span>{isPlayingAudio ? (isBn ? 'অডিও থামান' : 'Pause Audio') : (isBn ? 'অডিও শুনুন' : 'Listen to Editorial')}</span>
                </button>
              </div>

              {/* Audio Listen Simulation Bar */}
              {isPlayingAudio && (
                <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs text-teal-900 font-medium">
                    <span className="flex items-center gap-2">
                      <Volume2 size={16} className="text-teal-800 animate-pulse" />
                      <span>{isBn ? 'দৈনিক অভিমত অডিও পাঠ সম্প্রচার চলছে…' : 'Playing Audio Edition…'}</span>
                    </span>
                    <span className="font-mono text-[11px]">{Math.round(audioProgress)}%</span>
                  </div>
                  <div className="w-full bg-teal-200/60 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-800 h-full transition-all duration-300"
                      style={{ width: `${audioProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Featured Image */}
              {article.featured_image && (
                <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-stone-100 border border-stone-200/80">
                  <Image
                    src={article.featured_image}
                    alt={title}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 75vw"
                  />
                  <div className="absolute bottom-2 right-2 bg-stone-900/80 backdrop-blur-xs text-[10px] font-mono text-stone-300 px-2 py-0.5 rounded">
                    © Doinik Obhimot Visual Archives
                  </div>
                </div>
              )}

              {/* Excerpt / Lead Paragraph */}
              {excerpt && (
                <div className={`p-5 rounded-xl border-l-4 ${themeClasses.pullquote} font-serif italic text-sm md:text-base leading-relaxed`}>
                  {excerpt}
                </div>
              )}

              {/* Main Article Prose Body */}
              <div
                className={`prose max-w-none font-serif ${fontSizeClasses} ${themeClasses.prose} space-y-4 pt-2`}
                dangerouslySetInnerHTML={{ __html: content }}
              />

              {/* Article Footer & Credo */}
              <div className="pt-8 mt-8 border-t border-stone-200 space-y-4">
                <div className="p-4 rounded-xl bg-stone-50/80 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-teal-900">
                      <Feather size={13} />
                      <span>{isBn ? 'দৈনিক অভিমত সম্পাদকীয় দর্শন' : 'Editorial Creed'}</span>
                    </div>
                    <p className="text-xs text-stone-600 font-serif">
                      {isBn
                        ? 'আমরা নিরপেক্ষতা, মুক্তচিন্তা এবং দীর্ঘস্থায়ী সাংস্কৃতিক রুচির প্রতি দায়বদ্ধ।'
                        : 'Committed to independent perspectives, cultural craftsmanship, and dignified inquiry.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleLike}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition ${
                        liked
                          ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold'
                          : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <Heart size={14} className={liked ? 'fill-rose-600' : ''} />
                      <span>{liked ? (isBn ? 'পছন্দ করেছেন' : 'Liked') : (isBn ? 'পছন্দ করুন' : 'Like')} ({likesCount})</span>
                    </button>
                    <button
                      onClick={handleBookmark}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition ${
                        bookmarked
                          ? 'bg-teal-50 border-teal-300 text-teal-800 font-bold'
                          : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <Bookmark size={14} className={bookmarked ? 'fill-teal-800' : ''} />
                      <span>{bookmarked ? (isBn ? 'সংরক্ষিত' : 'Saved') : (isBn ? 'সংরক্ষণ' : 'Save')}</span>
                    </button>
                  </div>
                </div>

                {/* Reader Comments Section */}
                <div className="pt-6 space-y-6">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                    <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-stone-800 flex items-center gap-2">
                      <MessageSquare size={15} className="text-teal-800" />
                      <span>{isBn ? 'পাঠক মতামত ও পর্যালোচনা' : 'Reader Perspectives'} ({comments.length})</span>
                    </h3>
                    <span className="text-xs text-stone-400 font-serif">
                      {isBn ? 'শালীন ও গঠনমূলক মন্তব্য কাম্য' : 'Civil discourse welcome'}
                    </span>
                  </div>

                  {/* Comment Form */}
                  <form onSubmit={handleAddComment} className="space-y-3 bg-stone-50/60 p-4 rounded-xl border border-stone-200/80">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder={isBn ? 'আপনার নাম (ঐচ্ছিক)' : 'Your Name (optional)'}
                        value={newCommentName}
                        onChange={(e) => setNewCommentName(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-stone-300 text-xs bg-white outline-none focus:border-teal-700"
                      />
                    </div>
                    <textarea
                      rows={3}
                      placeholder={isBn ? 'এই সম্পাদকীয় নিয়ে আপনার মতামত লিখুন…' : 'Share your perspective on this editorial…'}
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs bg-white outline-none focus:border-teal-700"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-teal-900 transition"
                      >
                        {isBn ? 'অভিমত প্রকাশ করুন' : 'Submit Perspective'}
                      </button>
                    </div>
                  </form>

                  {/* Comment List */}
                  <div className="space-y-3">
                    {comments.map((c) => (
                      <div key={c.id} className="p-4 rounded-xl bg-white border border-stone-200/80 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-serif font-bold text-stone-900">{c.author}</span>
                          <span className="text-[11px] font-mono text-stone-400">{c.date}</span>
                        </div>
                        <p className="text-xs text-stone-600 font-serif leading-relaxed">{c.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </article>

          {/* Right Sidebar: Columnist Bio & Related Opinions (3-4 Cols) */}
          <aside className="lg:col-span-3 space-y-6">
            
            {/* Columnist Profile Card */}
            <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-900 flex items-center justify-center font-serif font-bold text-lg border border-teal-200/80">
                  {article.author ? article.author.charAt(0) : 'দ'}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-stone-900">
                    {article.author || FICTITIOUS_EDITORIAL_TEAM.editorInChief.name_bn}
                  </h3>
                  <p className="text-[11px] text-stone-500 font-mono">
                    {isBn ? 'প্রধান কলামিস্ট ও কিউরেটর' : 'Senior Editorial Columnist'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-stone-600 font-serif leading-relaxed">
                {isBn
                  ? 'দৈনিক অভিমতের সম্পাদকীয় বোর্ড ও গবেষণাগারের নিয়মিত লেখক। প্রযুক্তি, ঐতিহ্যবাহী বুনন ও সমকালীন সমাজভাবনা নিয়ে নিয়মিত লিখছেন।'
                  : 'Contributing editor at Doinik Obhimot. Exploring the intersection of digital craft, wearable ergonomics, and Bengal cultural philosophy.'}
              </p>
              <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500 font-mono">
                {EDITORIAL_CONTACTS.email}
              </div>
            </div>

            {/* Related Editorial Opinions */}
            <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                  <BookOpen size={14} className="text-teal-800" />
                  {isBn ? 'সম্পর্কিত মতামত ও বিশ্লেষণ' : 'Related Opinions'}
                </span>
              </div>

              <div className="space-y-4 divide-y divide-stone-100">
                {relatedArticles.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/${lang}/article/${rel.id}`}
                    className="block pt-3 first:pt-0 group"
                  >
                    <span className="text-[10px] font-mono text-teal-800 font-semibold uppercase">
                      {rel.category}
                    </span>
                    <h4 className="font-serif font-bold text-xs text-stone-900 group-hover:text-teal-900 transition line-clamp-2 leading-snug mt-0.5">
                      {isBn && rel.title_bn ? rel.title_bn : rel.title}
                    </h4>
                    <p className="text-[11px] text-stone-500 font-serif line-clamp-2 mt-1 leading-relaxed">
                      {isBn && rel.excerpt_bn ? rel.excerpt_bn : rel.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Daily Broadsheet Quote */}
            <div className="p-4 rounded-2xl bg-[#F5F1E8] border border-stone-200/90 space-y-2">
              <Quote size={18} className="text-teal-900/60" />
              <p className="text-xs font-serif italic text-stone-800 leading-relaxed">
                {isBn
                  ? '“চিন্তার গভীরতাই দৈনিক অভিমতের মূল সুর; প্রতিটি শব্দ এখানে সত্য ও রুচির মানদণ্ডে পরীক্ষিত।”'
                  : '“Intellectual depth is the signature of Doinik Obhimot; every perspective is weighed with care and clarity.”'}
              </p>
            </div>

          </aside>

        </div>
      </main>

      {/* Share Modal */}
      {shareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-stone-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-serif font-bold text-base text-stone-900">
                {isBn ? 'নিবন্ধটি শেয়ার করুন' : 'Share Perspective'}
              </h3>
              <button
                onClick={() => setShareOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600 font-serif">
              {title}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-stone-200 text-xs font-medium hover:bg-stone-50"
              >
                <Share2 size={14} />
                <span>{copied ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'লিংক কপি' : 'Copy Link')}</span>
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(title + ' ' + (typeof window !== 'undefined' ? window.location.href : ''))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700"
              >
                <span>WhatsApp</span>
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-stone-900 text-white text-xs font-medium hover:bg-black"
              >
                <span>Twitter / X</span>
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
              >
                <span>Facebook</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
