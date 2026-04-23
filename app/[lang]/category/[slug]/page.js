'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { bn } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function CategoryPage() {
  const params = useParams()
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug
  const lang = Array.isArray(params.lang) ? params.lang[0] : params.lang

  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const normalizedCategory = slug ? slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase() : ''

  useEffect(() => {
    if (slug) fetchCategoryArticles()
  }, [slug, lang])

  async function fetchCategoryArticles() {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('category', normalizedCategory)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
      if (error) throw error
      setArticles(data || [])
    } catch (err) {
      console.error('Failed to fetch category articles:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    if (!date) return ''
    try {
      return format(new Date(date), 'PP', {
        locale: lang === 'bn' ? bn : undefined,
      })
    } catch {
      return date
    }
  }

  const categoryNames = {
    bn: {
      politics: 'রাজনীতি',
      technology: 'প্রযুক্তি',
      business: 'বাণিজ্য',
      sports: 'খেলা',
      entertainment: 'বিনোদন',
      international: 'আন্তর্জাতিক',
satire: 'স্যাটায়ার'
    },
    en: {
      politics: 'Politics',
      technology: 'Technology',
      business: 'Business',
      sports: 'Sports',
      entertainment: 'Entertainment',
      international: 'International',
satire: 'satire'
    },
  }

  const categoryName = categoryNames[lang]?.[slug?.toLowerCase()] || slug || 'Category'

  const getLocalizedTitle = (article) => {
    if (lang === 'bn' && article.title_bn) return article.title_bn
    return article.title
  }

  const getLocalizedExcerpt = (article) => {
    if (lang === 'bn' && article.excerpt_bn) return article.excerpt_bn
    return article.excerpt
  }

  if (loading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="container-custom py-8 text-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg max-w-md mx-auto">
          <p className="text-lg font-semibold mb-2">Failed to load articles</p>
          <p className="text-sm mb-4">{error}</p>
          <button
            onClick={fetchCategoryArticles}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className={`text-4xl font-bold mb-4 ${lang === 'bn' ? 'font-bangla' : ''}`}>
          {categoryName}
        </h1>
      </div>

      {articles.length === 0 ? (
        <p className="text-center text-gray-500 py-12">
          {lang === 'bn' ? 'কোনো আর্টিকেল পাওয়া যায়নি' : 'No articles found'}
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition flex flex-col"
            >
              {/* Image section with fallback */}
              <div className="relative h-48 bg-gray-100">
                {article.featured_image ? (
                  <Image
                    src={article.featured_image}
                    alt={getLocalizedTitle(article)}
                    fill
                    className="object-contain" // ← Full image, no cropping
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      const parent = e.currentTarget.parentElement
                      if (parent) {
                        const fallbackDiv = document.createElement('div')
                        fallbackDiv.className = 'w-full h-full flex items-center justify-center bg-gray-200 text-gray-500'
                        fallbackDiv.innerHTML = '📷'
                        parent.appendChild(fallbackDiv)
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                    <span className="text-sm">No image</span>
                  </div>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <Link href={`/${lang}/article/${article.id}`}>
                  <h2
                    className={`text-xl font-bold mb-2 hover:text-red-600 transition line-clamp-2 ${
                      lang === 'bn' ? 'font-bangla' : ''
                    }`}
                  >
                    {getLocalizedTitle(article)}
                  </h2>
                </Link>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {getLocalizedExcerpt(article)}
                </p>
                <div className="flex justify-between items-center text-sm text-gray-500 mt-auto">
                  <span>{article.author || (lang === 'bn' ? 'স্টাফ' : 'Staff')}</span>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{formatDate(article.published_at)}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
