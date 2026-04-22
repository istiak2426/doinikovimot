'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Calendar,
  Eye,
  User,
  ArrowLeft,
  Heart,
  Share2,
  Bookmark,
  MessageCircle,
  Clock,
  ChevronRight,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  Check,
  TrendingUp,
  Award,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { bn } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'

// Simple toast notification component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full shadow-lg text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-300 ${
      type === 'success' ? 'bg-green-600 text-white' : 'bg-gray-800 text-white'
    }`}>
      {message}
    </div>
  )
}

export default function DynamicArticleClient({ initialArticle }) {
  const params = useParams()
  const id = params?.id
  const lang = params?.lang || 'bn'

  const [article, setArticle] = useState(initialArticle || null)
  const [loading, setLoading] = useState(!initialArticle)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(initialArticle?.likes || 0)
  const [bookmarked, setBookmarked] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [relatedArticles, setRelatedArticles] = useState([])
  const [relatedLoading, setRelatedLoading] = useState(true)
  const [readingProgress, setReadingProgress] = useState(0)
  const [toast, setToast] = useState(null)
  const [copied, setCopied] = useState(false)
  const articleRef = useRef(null)
  const isBn = lang === 'bn'

  // Reading progress bar
  useEffect(() => {
    const handleScroll = () => {
      if (!articleRef.current) return
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100
      setReadingProgress(Math.min(100, Math.max(0, progress)))
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Check local storage for liked and bookmarked
  useEffect(() => {
    const likedKey = `liked_${id}`
    const bookmarkedKey = `bookmarked_${id}`
    if (localStorage.getItem(likedKey)) setLiked(true)
    if (localStorage.getItem(bookmarkedKey)) setBookmarked(true)
  }, [id])

  // Fetch article if not provided initially
  useEffect(() => {
    if (!article && id) fetchArticle()
    else if (article && id) {
      incrementViews()
      fetchRelatedArticles()
    }
  }, [id, article])

  async function fetchArticle() {
    setLoading(true)
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching article:', error)
      setLoading(false)
      return
    }

    setArticle(data)
    setLikesCount(data?.likes || 0)
    setLoading(false)
    incrementViews(data?.id)
    fetchRelatedArticles(data)
  }

  async function incrementViews(articleId = id) {
    if (!articleId) return
    await supabase.rpc('increment_views', { row_id: articleId }).catch(console.error)
  }

  async function fetchRelatedArticles(currentArticle = article) {
    if (!currentArticle) return
    setRelatedLoading(true)
    
    // Try to fetch articles with same category, fallback to latest
    let query = supabase
      .from('articles')
      .select('id, title, title_bn, slug, featured_image, published_at, views, category')
      .neq('id', currentArticle.id)
      .limit(4)

    if (currentArticle.category) {
      query = query.eq('category', currentArticle.category)
    }

    const { data, error } = await query
    if (!error && data) {
      setRelatedArticles(data.slice(0, 4))
    } else {
      // Fallback to latest articles
      const { data: latest } = await supabase
        .from('articles')
        .select('id, title, title_bn, slug, featured_image, published_at, views')
        .neq('id', currentArticle.id)
        .order('published_at', { ascending: false })
        .limit(4)
      setRelatedArticles(latest || [])
    }
    setRelatedLoading(false)
  }

  async function handleLike() {
    if (liked || !article) return

    const newLikes = likesCount + 1
    setLikesCount(newLikes)
    setLiked(true)
    localStorage.setItem(`liked_${id}`, 'true')

    // Optimistic update with rollback possibility
    const { error } = await supabase
      .from('articles')
      .update({ likes: newLikes })
      .eq('id', article.id)

    if (error) {
      setLikesCount(likesCount)
      setLiked(false)
      localStorage.removeItem(`liked_${id}`)
      setToast({ message: 'Failed to like. Please try again.', type: 'error' })
    } else {
      setToast({ message: 'Thanks for your reaction!', type: 'success' })
    }
  }

  function handleBookmark() {
    const newState = !bookmarked
    setBookmarked(newState)
    if (newState) {
      localStorage.setItem(`bookmarked_${id}`, 'true')
      setToast({ message: 'Article saved to bookmarks', type: 'success' })
    } else {
      localStorage.removeItem(`bookmarked_${id}`)
      setToast({ message: 'Removed from bookmarks', type: 'success' })
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setToast({ message: 'Link copied to clipboard!', type: 'success' })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      setToast({ message: 'Failed to copy link', type: 'error' })
    }
  }

  const title = (isBn && article?.title_bn) || article?.title
  const content = (isBn && article?.content_bn) || article?.content
  const excerpt = (isBn && article?.excerpt_bn) || article?.excerpt
  const readingTime = content ? Math.ceil(content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200) : 3

  if (loading) return <LoadingSpinner />
  if (!article) return <NotFoundPage lang={lang} />

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-red-100 z-50">
        <div
          className="h-full bg-red-600 transition-all duration-200"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href={`/${lang}`} className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors">
            <ArrowLeft size={18} /> 
            <span className="hidden sm:inline">{isBn ? 'ফিরে যান' : 'Back'}</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBookmark}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Bookmark"
            >
              <Bookmark size={18} className={bookmarked ? 'fill-red-500 text-red-500' : ''} />
            </button>
            <button
              onClick={() => setShareOpen(true)}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Share"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Share Bar (Desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-28 flex flex-col items-center gap-4">
              <button
                onClick={handleLike}
                className="group relative p-3 bg-white shadow-md rounded-full hover:shadow-lg transition-all duration-200 hover:scale-110"
              >
                <Heart 
                  size={22} 
                  className={`transition-all duration-200 ${liked ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-500 group-hover:text-red-400'}`} 
                />
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-500">
                  {likesCount}
                </span>
              </button>

              <button
                onClick={() => setShareOpen(true)}
                className="p-3 bg-white shadow-md rounded-full hover:shadow-lg transition-all duration-200 hover:scale-110"
              >
                <Share2 size={20} className="text-gray-600" />
              </button>

              <button
                onClick={handleBookmark}
                className="p-3 bg-white shadow-md rounded-full hover:shadow-lg transition-all duration-200 hover:scale-110"
              >
                <Bookmark size={20} className={bookmarked ? 'fill-red-500 text-red-500' : 'text-gray-600'} />
              </button>
            </div>
          </div>

          {/* Article Content */}
          <article className="lg:col-span-7 xl:col-span-8" ref={articleRef}>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Category Badge */}
              {article.category && (
                <div className="px-6 pt-6">
                  <Link 
                    href={`/${lang}/category/${article.category}`}
                    className="inline-block px-3 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full hover:bg-red-100 transition-colors"
                  >
                    {article.category}
                  </Link>
                </div>
              )}

              <div className="p-6 md:p-8">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight tracking-tight">
                  {title}
                </h1>

                {/* Author & Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-4 border-b">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white text-xs font-bold">
                      {article.author?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{article.author}</div>
                      <div className="text-xs text-gray-400">Author</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {format(new Date(article.published_at), 'PPP', {
                        locale: isBn ? bn : undefined,
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {readingTime} min read
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={14} /> {article.views?.toLocaleString() || 0} views
                    </span>
                  </div>
                </div>

                {/* Featured Image */}
                {article.featured_image && (
                  <div className="relative w-full h-64 md:h-96 mb-6 rounded-xl overflow-hidden">
                    <Image
                      src={article.featured_image}
                      alt={title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                )}

                {/* Excerpt */}
                {excerpt && (
                  <div className="text-lg italic text-gray-700 mb-6 border-l-4 border-red-500 pl-4 bg-gray-50 py-3 rounded-r-lg">
                    {excerpt}
                  </div>
                )}

                {/* Content */}
                <div
                  className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-red-600 prose-img:rounded-lg"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>
            </div>
          </article>

          {/* Right Sidebar */}
          <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
            {/* Author Bio Card */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold text-lg">
                  {article.author?.charAt(0) || 'A'}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{article.author}</h3>
                  <p className="text-xs text-gray-500">Senior Journalist</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Experienced journalist covering politics, technology, and culture. 
                Passionate about storytelling and uncovering the truth.
              </p>
              <button className="text-red-600 text-sm font-medium hover:underline">
                View all articles →
              </button>
            </div>

            {/* Related Articles */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <TrendingUp size={18} className="text-red-500" />
                  {isBn ? 'সম্পর্কিত' : 'Related Articles'}
                </h3>
                <ChevronRight size={16} className="text-gray-400" />
              </div>

              {relatedLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse flex gap-3">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {relatedArticles.map(rel => (
                    <Link 
                      key={rel.id} 
                      href={`/${lang}/article/${rel.slug || rel.id}`}
                      className="group flex gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                    >
                      {rel.featured_image && (
                        <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                          <Image
                            src={rel.featured_image}
                            alt={rel.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-sm line-clamp-2 group-hover:text-red-600 transition-colors">
                          {isBn && rel.title_bn ? rel.title_bn : rel.title}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Calendar size={10} />
                          {formatDistanceToNow(new Date(rel.published_at), { 
                            addSuffix: true,
                            locale: isBn ? bn : undefined
                          })}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Trending Topics */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-bold text-lg flex items-center gap-2 mb-3">
                <Award size={18} className="text-red-500" />
                {isBn ? 'ট্রেন্ডিং' : 'Trending Topics'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {['Politics', 'Technology', 'Sports', 'Entertainment', 'Business', 'Health'].map(topic => (
                  <Link
                    key={topic}
                    href={`/${lang}/category/${topic.toLowerCase()}`}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
                  >
                    {topic}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile Floating Action Bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm shadow-lg rounded-full px-5 py-2.5 flex gap-6 z-50 lg:hidden border">
        <button onClick={handleLike} className="flex flex-col items-center gap-0.5">
          <Heart size={20} className={liked ? 'fill-red-500 text-red-500' : 'text-gray-600'} />
          <span className="text-[10px] text-gray-500">{likesCount}</span>
        </button>
        <button onClick={handleBookmark} className="flex flex-col items-center gap-0.5">
          <Bookmark size={20} className={bookmarked ? 'fill-red-500 text-red-500' : 'text-gray-600'} />
          <span className="text-[10px] text-gray-500">Save</span>
        </button>
        <button onClick={() => setShareOpen(true)} className="flex flex-col items-center gap-0.5">
          <Share2 size={20} className="text-gray-600" />
          <span className="text-[10px] text-gray-500">Share</span>
        </button>
      </div>

      {/* Share Modal */}
      {shareOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end z-50 animate-in fade-in duration-200">
          <div className="bg-white w-full rounded-t-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-5">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-semibold text-lg">Share this article</h3>
                <button 
                  onClick={() => setShareOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-4 gap-3 text-center mb-5">
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title,
                        text: excerpt,
                        url: window.location.href,
                      }).catch(() => {})
                    }
                  }}
                  className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Share2 size={22} className="text-gray-700" />
                  <span className="text-xs">Native</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  {copied ? <Check size={22} className="text-green-600" /> : <LinkIcon size={22} className="text-gray-700" />}
                  <span className="text-xs">{copied ? 'Copied!' : 'Copy'}</span>
                </button>

                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-3 bg-[#1877F2]/10 rounded-xl hover:bg-[#1877F2]/20 transition-colors"
                >
                  <Facebook size={22} className="text-[#1877F2]" />
                  <span className="text-xs">Facebook</span>
                </a>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(title + ' ' + window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-3 bg-[#25D366]/10 rounded-xl hover:bg-[#25D366]/20 transition-colors"
                >
                  <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="#25D366">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.967-.94 1.165-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  </svg>
                  <span className="text-xs">WhatsApp</span>
                </a>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Twitter size={18} className="text-[#1DA1F2]" />
                  <span className="text-sm">Twitter</span>
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Linkedin size={18} className="text-[#0A66C2]" />
                  <span className="text-sm">LinkedIn</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  )
}

// Simple 404 component
function NotFoundPage({ lang }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <p className="text-gray-600 mb-6">
          {lang === 'bn' ? 'আর্টিকেলটি পাওয়া যায়নি' : 'Article not found'}
        </p>
        <Link href={`/${lang}`} className="text-red-600 hover:underline">
          {lang === 'bn' ? 'হোমপেজে ফিরুন' : 'Back to Home'}
        </Link>
      </div>
    </div>
  )
}
