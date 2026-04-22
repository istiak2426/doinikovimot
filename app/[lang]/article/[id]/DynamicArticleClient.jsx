'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar,
  Eye,
  User,
  ArrowLeft,
  Heart,
  Share2,
} from 'lucide-react'
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

  const title = (isBn && article?.title_bn) || article?.title
  const content = (isBn && article?.content_bn) || article?.content
  const excerpt = (isBn && article?.excerpt_bn) || article?.excerpt

  if (loading) return <LoadingSpinner />

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* 🔥 HEADER */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href={`/${lang}`} className="flex items-center gap-2 text-gray-600 hover:text-black">
            <ArrowLeft size={18} /> Back
          </Link>

          <button
            onClick={() => setShareOpen(true)}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* 🔥 MAIN LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* 🔥 LEFT SHARE BAR (DESKTOP) */}
        <div className="hidden lg:flex flex-col gap-3 fixed left-6 top-1/3 z-50">

          <button
            onClick={handleLike}
            className="p-3 bg-white shadow rounded-full hover:bg-gray-100"
          >
            <Heart size={18} className={liked ? 'fill-red-500 text-red-500' : ''} />
          </button>

          <button
            onClick={() => setShareOpen(true)}
            className="p-3 bg-white shadow rounded-full hover:bg-gray-100"
          >
            <Share2 size={18} />
          </button>

        </div>

        {/* 🔥 ARTICLE */}
        <article className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">

          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            {title}
          </h1>

          {/* META */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 border-b pb-4">
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

          {/* IMAGE */}
          {article.featured_image && (
            <img
              src={article.featured_image}
              alt={title}
              loading="lazy"
              className="w-full rounded-lg mb-6"
            />
          )}

          {/* EXCERPT */}
          {excerpt && (
            <p className="text-lg italic text-gray-700 mb-6 border-l-4 border-red-500 pl-4">
              {excerpt}
            </p>
          )}

          {/* CONTENT */}
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />

        </article>

        {/* 🔥 SIDEBAR */}
        <aside className="space-y-6">

          {/* RELATED NEWS */}
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <h3 className="font-bold mb-3 border-b pb-2">Related News</h3>

            <div className="space-y-3 text-sm">
              <div className="hover:text-red-600 cursor-pointer">
                🔹 আরেকটি খবর শিরোনাম এখানে
              </div>
              <div className="hover:text-red-600 cursor-pointer">
                🔹 গুরুত্বপূর্ণ সংবাদ আপডেট
              </div>
              <div className="hover:text-red-600 cursor-pointer">
                🔹 সর্বশেষ ব্রেকিং নিউজ
              </div>
            </div>
          </div>

          {/* AUTHOR BOX */}
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <h3 className="font-bold mb-2">Author</h3>
            <p className="text-sm text-gray-600">{article.author}</p>
          </div>

        </aside>

      </div>

      {/* 🔥 FLOATING ACTION BAR (MOBILE) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-full px-6 py-3 flex gap-6 z-50 lg:hidden">

        <button onClick={handleLike} className="flex items-center gap-2">
          <Heart size={20} className={liked ? 'fill-red-500 text-red-500' : ''} />
          {likesCount}
        </button>

        <button onClick={() => setShareOpen(true)}>
          <Share2 size={20} />
        </button>

      </div>

      {/* 🔥 SHARE MODAL */}
      {shareOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50">

          <div className="bg-white w-full p-5 rounded-t-2xl">

            <div className="flex justify-between mb-4">
              <h3 className="font-semibold text-lg">Share</h3>
              <button onClick={() => setShareOpen(false)}>✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">

              <button
                onClick={() =>
                  navigator.share?.({
                    title,
                    text: excerpt,
                    url: window.location.href,
                  })
                }
                className="p-3 bg-gray-100 rounded-lg"
              >
                Native Share
              </button>

              <button
                onClick={() =>
                  navigator.clipboard.writeText(window.location.href)
                }
                className="p-3 bg-gray-100 rounded-lg"
              >
                Copy Link
              </button>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                className="p-3 bg-blue-100 rounded-lg"
              >
                Facebook
              </a>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(title + ' ' + window.location.href)}`}
                target="_blank"
                className="p-3 bg-green-100 rounded-lg"
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
