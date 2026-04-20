'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Head from 'next/head'
import { Calendar, Eye, User, ArrowLeft, Heart, Share2 } from 'lucide-react'
import { format } from 'date-fns'
import { bn } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function ArticlePage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id
  const lang = params?.lang || 'bn'
  
  const [article, setArticle] = useState(null)
  const [relatedArticles, setRelatedArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pageUrl, setPageUrl] = useState('')
  
  useEffect(() => {
    // Set page URL for meta tags (client-side only)
    setPageUrl(window.location.href)
  }, [])
  
  useEffect(() => {
    if (id) {
      fetchArticle()
    } else {
      setError('No article ID provided')
      setLoading(false)
    }
  }, [id])
  
  async function fetchArticle() {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching article with ID:', id)
      
      // Fetch article - PUBLIC ACCESS (no auth required)
      const { data: articleData, error: articleError } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .eq('status', 'published') // Only show published articles
        .single()
      
      if (articleError) {
        console.error('Error fetching article:', articleError)
        setError(articleError.message)
        setLoading(false)
        return
      }
      
      if (!articleData) {
        setError('Article not found')
        setLoading(false)
        return
      }
      
      console.log('Article found:', articleData)
      setArticle(articleData)
      
      // Update view count (don't await to avoid blocking)
      supabase
        .from('articles')
        .update({ views: (articleData.views || 0) + 1 })
        .eq('id', id)
        .then(() => console.log('View count updated'))
        .catch(err => console.error('Error updating views:', err))
      
      // Fetch related articles (same category)
      if (articleData.category) {
        const { data: related } = await supabase
          .from('articles')
          .select('*')
          .eq('category', articleData.category)
          .eq('status', 'published')
          .neq('id', id)
          .limit(3)
        
        if (related) setRelatedArticles(related)
      }
      
    } catch (err) {
      console.error('Unexpected error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const formatDate = (date) => {
    if (!date) return ''
    try {
      return format(new Date(date), 'PPPP', {
        locale: lang === 'bn' ? bn : undefined
      })
    } catch {
      return date
    }
  }
  
  const shareArticle = () => {
    if (navigator.share) {
      navigator.share({
        title: getLocalizedTitle(),
        text: getLocalizedExcerpt(),
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert(lang === 'bn' ? 'লিংক কপি করা হয়েছে!' : 'Link copied to clipboard!')
    }
  }
  
  const getLocalizedTitle = () => {
    if (lang === 'bn' && article?.title_bn) {
      return article.title_bn
    }
    return article?.title || 'Untitled'
  }
  
  const getLocalizedContent = () => {
    if (lang === 'bn' && article?.content_bn) {
      return article.content_bn
    }
    return article?.content || '<p>No content available.</p>'
  }
  
  const getLocalizedExcerpt = () => {
    if (lang === 'bn' && article?.excerpt_bn) {
      return article.excerpt_bn
    }
    return article?.excerpt || ''
  }
  
  const getSiteTitle = () => {
    return `${getLocalizedTitle()} | Doinik Obhimot`
  }
  
  const getShareImage = () => {
    return article?.featured_image || 'https://doinikobhimot.vercel.app/og-image.jpg'
  }
  
  if (loading) return <LoadingSpinner />
  
  if (error || !article) {
    return (
      <>
        <Head>
          <title>Article Not Found | Doinik Obhimot</title>
          <meta name="robots" content="noindex" />
        </Head>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            {error || 'Article not found'}
          </h1>
          <p className="text-gray-600 mb-6">
            {lang === 'bn' 
              ? 'আর্টিকেলটি পাওয়া যায়নি বা সরানো হয়েছে।' 
              : 'The article could not be found or has been removed.'}
          </p>
          <Link href={`/${lang}`} className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700">
            {lang === 'bn' ? 'হোমে ফিরুন' : 'Back to Home'}
          </Link>
        </div>
      </>
    )
  }
  
  return (
    <>
      <Head>
        {/* Basic Meta Tags */}
        <title>{getSiteTitle()}</title>
        <meta name="description" content={getLocalizedExcerpt()} />
        <meta name="keywords" content={article?.category} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content={getLocalizedTitle()} />
        <meta property="og:description" content={getLocalizedExcerpt()} />
        <meta property="og:image" content={getShareImage()} />
        <meta property="og:image:alt" content={getLocalizedTitle()} />
        <meta property="og:site_name" content="Doinik Obhimot" />
        <meta property="article:published_time" content={article?.published_at} />
        <meta property="article:author" content={article?.author} />
        <meta property="article:section" content={article?.category} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={pageUrl} />
        <meta name="twitter:title" content={getLocalizedTitle()} />
        <meta name="twitter:description" content={getLocalizedExcerpt()} />
        <meta name="twitter:image" content={getShareImage()} />
        <meta name="twitter:image:alt" content={getLocalizedTitle()} />
        
        {/* Additional Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <link rel="canonical" href={pageUrl} />
        
        {/* Language Alternatives */}
        {article?.title_bn && (
          <>
            <link rel="alternate" href={`https://doinikobhimot.vercel.app/bn/article/${id}`} hrefLang="bn" />
            <link rel="alternate" href={`https://doinikobhimot.vercel.app/en/article/${id}`} hrefLang="en" />
          </>
        )}
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        <Link 
          href={`/${lang}`} 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 mb-6 transition"
        >
          <ArrowLeft size={20} />
          {lang === 'bn' ? 'হোমে ফিরুন' : 'Back to Home'}
        </Link>
        
        <article className="max-w-4xl mx-auto">
          <header className="mb-8">
            <Link href={`/${lang}/category/${article.category?.toLowerCase()}`}>
              <span className="text-red-600 font-semibold hover:underline">
                {article.category}
              </span>
            </Link>
            <h1 className={`text-3xl md:text-5xl font-bold mt-4 mb-4 ${lang === 'bn' ? 'font-bangla' : ''}`}>
              {getLocalizedTitle()}
            </h1>
            <div className="flex flex-wrap gap-4 text-gray-600 border-t border-b py-4">
              <div className="flex items-center gap-2">
                <User size={18} />
                <span>{article.author || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span>{formatDate(article.published_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye size={18} />
                <span>{article.views || 0} {lang === 'bn' ? 'দর্শন' : 'views'}</span>
              </div>
            </div>
          </header>
          
          {article.featured_image && (
            <div className="relative h-64 md:h-96 w-full mb-8 rounded-lg overflow-hidden bg-gray-100">
              <img 
                src={article.featured_image} 
                alt={getLocalizedTitle()}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/1200x600?text=Image+Not+Found'
                }}
              />
            </div>
          )}
          
          <div className={`prose prose-lg max-w-none mb-12 ${lang === 'bn' ? 'font-bangla' : ''}`}>
            {getLocalizedExcerpt() && (
              <p className="text-xl text-gray-700 font-medium leading-relaxed mb-6 italic">
                {getLocalizedExcerpt()}
              </p>
            )}
            <div dangerouslySetInnerHTML={{ __html: getLocalizedContent() }} />
          </div>
          
          <div className="flex items-center justify-between border-t pt-6">
            <button
              onClick={() => alert(lang === 'bn' ? 'পছন্দের জন্য ধন্যবাদ!' : 'Thanks for liking!')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              <Heart size={20} />
              <span>{lang === 'bn' ? 'পছন্দ' : 'Like'}</span>
            </button>
            <button
              onClick={shareArticle}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              <Share2 size={20} />
              <span>{lang === 'bn' ? 'শেয়ার করুন' : 'Share'}</span>
            </button>
          </div>
        </article>
        
        {relatedArticles.length > 0 && (
          <section className="max-w-4xl mx-auto mt-12 pt-8 border-t">
            <h3 className={`text-2xl font-bold mb-6 ${lang === 'bn' ? 'font-bangla' : ''}`}>
              {lang === 'bn' ? 'সম্পর্কিত আর্টিকেল' : 'Related Articles'}
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedArticles.map(related => {
                const relatedTitle = (lang === 'bn' && related.title_bn) ? related.title_bn : related.title
                return (
                  <Link href={`/${lang}/article/${related.id}`} key={related.id}>
                    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition p-4 cursor-pointer">
                      {related.featured_image && (
                        <div className="relative h-32 mb-3 rounded overflow-hidden bg-gray-100">
                          <img
                            src={related.featured_image}
                            alt={relatedTitle}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      <h4 className={`font-bold mb-2 hover:text-red-600 transition line-clamp-2 ${lang === 'bn' ? 'font-bangla' : ''}`}>
                        {relatedTitle}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {related.excerpt}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </>
  )
}