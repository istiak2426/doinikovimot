'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Head from 'next/head'
import { Calendar, Eye, User, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import { bn } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function ArticlePage() {
  const params = useParams()
  const id = params?.id
  const lang = params?.lang || 'bn'
  
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pageUrl, setPageUrl] = useState('')
  
  useEffect(() => {
    setPageUrl(window.location.href)
  }, [])
  
  useEffect(() => {
    if (id) {
      fetchArticle()
    }
  }, [id])
  
  async function fetchArticle() {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      if (!data) throw new Error('Article not found')
      
      setArticle(data)
      
      // Update view count
      await supabase
        .from('articles')
        .update({ views: (data.views || 0) + 1 })
        .eq('id', data.id)
      
    } catch (err) {
      console.error('Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const isBn = lang === 'bn'
  const title = isBn && article?.title_bn ? article.title_bn : article?.title
  const content = isBn && article?.content_bn ? article.content_bn : article?.content
  const excerpt = isBn && article?.excerpt_bn ? article.excerpt_bn : article?.excerpt
  
  if (loading) return <LoadingSpinner />
  
  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Article not found</h1>
        <p className="text-gray-600 mb-4">ID: {id}</p>
        <Link href={`/${lang}`} className="bg-red-600 text-white px-6 py-2 rounded-lg inline-block">
          {isBn ? 'হোমে ফিরুন' : 'Back Home'}
        </Link>
      </div>
    )
  }
  
  return (
    <>
      <Head>
        <title>{title} | Doinik Obhimot</title>
        <meta name="description" content={excerpt} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={excerpt} />
        <meta property="og:image" content={article.featured_image} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={excerpt} />
        <meta name="twitter:image" content={article.featured_image} />
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        <Link href={`/${lang}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 mb-6">
          <ArrowLeft size={20} /> {isBn ? 'হোমে ফিরুন' : 'Back'}
        </Link>
        
        <article className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{title}</h1>
          
          <div className="flex gap-4 text-gray-600 border-t border-b py-4 mb-6">
            <span className="flex items-center gap-1"><User size={16} /> {article.author || 'Doinik Obhimot'}</span>
            <span className="flex items-center gap-1"><Calendar size={16} /> {format(new Date(article.published_at), 'PPP', { locale: isBn ? bn : undefined })}</span>
            <span className="flex items-center gap-1"><Eye size={16} /> {article.views || 0}</span>
          </div>
          
          {article.featured_image && (
            <img src={article.featured_image} alt={title} className="w-full h-auto rounded-lg mb-6" />
          )}
          
          {excerpt && <p className="text-xl italic border-l-4 border-red-500 pl-4 mb-6">{excerpt}</p>}
          
          <div dangerouslySetInnerHTML={{ __html: content }} className="prose max-w-none" />
        </article>
      </div>
    </>
  )
}