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
  const [shareOpen, setShareOpen] = useState(false)

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

  function handleNativeShare() {
    if (!article) return

    const title =
      (lang === 'bn' && article?.title_bn) || article?.title || 'Article'

    const text =
      (lang === 'bn' && article?.excerpt_bn) || article?.excerpt || ''

    if (navigator.share) {
      navigator.share({
        title,
        text,
        url: window.location.href,
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
        <Link href={`/${lang}`} className="bg-red-600 text-white px-6 py-2 rounded-lg">
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

        {/* Back */}
        <Link href={`/${lang}`} className="inline-flex items-center gap-2 text-gray-600 mb-6">
          <ArrowLeft size={18} />
          {isBn ? 'হোমে ফিরুন' : 'Back'}
        </Link>

        <article className="max-w-4xl mx-auto">

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            {title}
          </h1>

          {/* Meta */}
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

          {/* Image */}
          {article.featured_image && (
            <img
              src={article.featured_image}
              className="w-full rounded-lg mb-6"
              alt={title}
            />
          )}

          {/* Excerpt */}
          {excerpt && (
            <p className="text-xl italic border-l-4 border-red-500 pl-4 mb-6">
              {excerpt}
            </p>
          )}

          {/* Content */}
          <div dangerouslySetInnerHTML={{ __html: content }} />

          {/* ACTION BAR */}
          <div className="flex items-center justify-between border-t pt-6 mt-8">

            {/* Like */}
            <button
              onClick={handleLike}
              disabled={liked}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                liked
                  ? 'bg-red-100 text-red-600'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <Heart size={18} className={liked ? 'fill-red-600' : ''} />
              {likesCount}
            </button>

            {/* Share (Prothom Alo style) */}
            <button
              onClick={() => setShareOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Share2 size={18} />
              Share
            </button>

          </div>
        </article>

        {/* ================= SHARE BOTTOM SHEET ================= */}
        {shareOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-end z-50">

            <div className="w-full bg-white rounded-t-2xl p-4 animate-slideUp">

              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {isBn ? 'শেয়ার করুন' : 'Share'}
                </h3>

                <button onClick={() => setShareOpen(false)}>
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">

                {/* Native */}
                <button
                  onClick={() => {
                    setShareOpen(false)
                    handleNativeShare()
                  }}
                  className="p-3 bg-gray-100 rounded-lg"
                >
                  📲 Share
                </button>

                {/* Copy */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                    setShareOpen(false)
                  }}
                  className="p-3 bg-gray-100 rounded-lg"
                >
                  🔗 Copy
                </button>

                {/* Facebook */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  onClick={() => setShareOpen(false)}
                  className="p-3 bg-blue-100 rounded-lg text-center"
                >
                  Facebook
                </a>

                {/* WhatsApp */}
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(title + ' ' + window.location.href)}`}
                  target="_blank"
                  onClick={() => setShareOpen(false)}
                  className="p-3 bg-green-100 rounded-lg text-center"
                >
                  WhatsApp
                </a>

              </div>

            </div>
          </div>
        )}

      </div>
    </>
  )
}