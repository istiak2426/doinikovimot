'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Head from 'next/head'
import { Calendar, Eye, User, ArrowLeft, Heart, Share2 } from 'lucide-react'
import { format } from 'date-fns'
import { bn } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function DynamicArticlePage() {
  const params = useParams()
  const id = params?.id
  const lang = params?.lang || 'bn'

  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)

  const [pageUrl, setPageUrl] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPageUrl(window.location.href)
    }

    const likedKey = `liked_${id}`
    if (localStorage.getItem(likedKey)) {
      setLiked(true)
    }
  }, [id])

  useEffect(() => {
    if (id) fetchArticle()
  }, [id])

  function showToast(message) {
    setToast(message)
    setTimeout(() => setToast(''), 2000)
  }

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
      setLikesCount(data.likes || 0)

      await supabase
        .from('articles')
        .update({ views: (data.views || 0) + 1 })
        .eq('id', data.id)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleLike() {
    if (liked || !article) return

    const newLikes = likesCount + 1
    setLikesCount(newLikes)
    setLiked(true)

    localStorage.setItem(`liked_${id}`, 'true')

    await supabase
      .from('articles')
      .update({ likes: newLikes })
      .eq('id', article.id)
  }

  function handleShareNative() {
    if (!article) return

    const shareUrl = window.location.href
    const title =
      (lang === 'bn' && article?.title_bn) || article?.title || 'Doinik Obhimot'
    const text =
      (lang === 'bn' && article?.excerpt_bn) || article?.excerpt || ''

    if (navigator.share) {
      navigator.share({
        title,
        text,
        url: shareUrl,
      }).catch(err => {
        if (err.name !== 'AbortError') {
          console.log(err)
        }
      })
    }
  }

  const isBn = lang === 'bn'

  const title =
    (isBn && article?.title_bn) || article?.title

  const content =
    (isBn && article?.content_bn) || article?.content

  const excerpt =
    (isBn && article?.excerpt_bn) || article?.excerpt

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          {isBn ? 'আর্টিকেলটি পাওয়া যায়নি' : 'Article Not Found'}
        </h1>
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
      </Head>

      <div className="container mx-auto px-4 py-8">

        <Link href={`/${lang}`} className="inline-flex items-center gap-2 text-gray-600 mb-6">
          <ArrowLeft size={20} /> {isBn ? 'হোমে ফিরুন' : 'Back'}
        </Link>

        <article className="max-w-4xl mx-auto">

          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            {title}
          </h1>

          <div className="flex gap-4 text-gray-600 border-t border-b py-4 mb-6">
            <span className="flex items-center gap-1">
              <User size={16} /> {article.author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={16} />
              {format(new Date(article.published_at), 'PPP', {
                locale: isBn ? bn : undefined,
              })}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={16} />
              {article.views || 0}
            </span>
          </div>

          {article.featured_image && (
            <img
              src={article.featured_image}
              className="w-full rounded-lg mb-6"
            />
          )}

          {excerpt && (
            <p className="text-xl italic border-l-4 border-red-500 pl-4 mb-6">
              {excerpt}
            </p>
          )}

          <div dangerouslySetInnerHTML={{ __html: content }} />

          {/* ACTIONS */}
          <div className="flex flex-wrap gap-2 items-center border-t pt-6 mt-8">

            {/* LIKE */}
            <button
              onClick={handleLike}
              disabled={liked}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                liked
                  ? 'bg-red-100 text-red-600'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <Heart size={20} className={liked ? 'fill-red-600' : ''} />
              {likesCount}
            </button>

            {/* Native Share */}
            <button
              onClick={handleShareNative}
              className="px-3 py-2 bg-gray-800 text-white rounded-lg"
            >
              <Share2 size={18} /> Share
            </button>

            {/* Facebook */}
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`}
              target="_blank"
              className="px-3 py-2 bg-blue-600 text-white rounded-lg"
            >
              Facebook
            </a>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/?text=${encodeURIComponent(title + ' ' + pageUrl)}`}
              target="_blank"
              className="px-3 py-2 bg-green-600 text-white rounded-lg"
            >
              WhatsApp
            </a>

            {/* Twitter */}
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(pageUrl)}`}
              target="_blank"
              className="px-3 py-2 bg-black text-white rounded-lg"
            >
              Twitter
            </a>

            {/* COPY */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(pageUrl)
                showToast(isBn ? 'লিংক কপি হয়েছে!' : 'Link copied!')
              }}
              className="px-3 py-2 bg-red-600 text-white rounded-lg"
            >
              Copy
            </button>
          </div>
        </article>

        {/* TOAST */}
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg">
            {toast}
          </div>
        )}

      </div>
    </>
  )
}