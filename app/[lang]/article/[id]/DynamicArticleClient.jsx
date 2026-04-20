'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Eye, User, ArrowLeft, Heart, Share2 } from 'lucide-react'
import { format } from 'date-fns'
import { bn } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function DynamicArticleClient({ initialArticle }) {
  const params = useParams()
  const id = params?.id
  const lang = params?.lang || 'bn'

  const [article, setArticle] = useState(initialArticle || null)
  const [loading, setLoading] = useState(!initialArticle)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(initialArticle?.likes || 0)
  const [shareOpen, setShareOpen] = useState(false)

  useEffect(() => {
    const likedKey = `liked_${id}`
    if (localStorage.getItem(likedKey)) setLiked(true)
  }, [id])

  useEffect(() => {
    if (!article && id) fetchArticle()
  }, [id])

  async function fetchArticle() {
    setLoading(true)

    const { data } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single()

    setArticle(data)
    setLikesCount(data?.likes || 0)
    setLoading(false)
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

  const isBn = lang === 'bn'

  const title =
    (isBn && article?.title_bn) || article?.title

  const content =
    (isBn && article?.content_bn) || article?.content

  const excerpt =
    (isBn && article?.excerpt_bn) || article?.excerpt

  if (loading) return <LoadingSpinner />

  return (
    <div className="container mx-auto px-4 py-8">

      <Link href={`/${lang}`} className="flex items-center gap-2 mb-4">
        <ArrowLeft size={18} /> Back
      </Link>

      <article className="max-w-4xl mx-auto">

        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          {title}
        </h1>

        <div className="flex gap-4 text-gray-500 mb-6 flex-wrap">
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
            <Eye size={16} /> {article.views}
          </span>
        </div>

        {article.featured_image && (
          <img
            src={article.featured_image}
            className="mb-6 rounded-lg w-full"
            alt={title}
          />
        )}

        {excerpt && (
          <p className="italic mb-6 border-l-4 pl-4 border-red-500">
            {excerpt}
          </p>
        )}

        <div dangerouslySetInnerHTML={{ __html: content }} />

        {/* ACTION BAR */}
        <div className="flex justify-between mt-8 border-t pt-6">

          <button
            onClick={handleLike}
            disabled={liked}
            className={`flex items-center gap-2 px-4 py-2 rounded ${
              liked ? 'bg-red-100 text-red-600' : 'bg-gray-100'
            }`}
          >
            <Heart size={18} className={liked ? 'fill-red-600' : ''} />
            {likesCount}
          </button>

          <button
            onClick={() => setShareOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded"
          >
            <Share2 size={18} />
            Share
          </button>

        </div>
      </article>

      {/* 🔥 PROTHOM ALO STYLE SHARE */}
      {shareOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50">

          <div className="bg-white w-full p-4 rounded-t-2xl">

            <div className="flex justify-between mb-4">
              <h3 className="font-semibold">Share</h3>
              <button onClick={() => setShareOpen(false)}>✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3">

              <button
                onClick={() =>
                  navigator.share?.({
                    title,
                    text: excerpt,
                    url: window.location.href,
                  })
                }
                className="p-3 bg-gray-100 rounded"
              >
                Share
              </button>

              <button
                onClick={() =>
                  navigator.clipboard.writeText(window.location.href)
                }
                className="p-3 bg-gray-100 rounded"
              >
                Copy Link
              </button>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                className="p-3 bg-blue-100 rounded text-center"
              >
                Facebook
              </a>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(title + ' ' + window.location.href)}`}
                target="_blank"
                className="p-3 bg-green-100 rounded text-center"
              >
                WhatsApp
              </a>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}