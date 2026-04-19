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
  const { slug, lang } = useParams()
  const [articles, setArticles] = useState([])
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (slug) fetchCategoryArticles()
  }, [slug, lang])
  
  async function fetchCategoryArticles() {
    setLoading(true)
    
    const { data: articlesData } = await supabase
      .from('articles')
      .select('*')
      .eq('category', slug.charAt(0).toUpperCase() + slug.slice(1))
      .eq('status', 'published')
      .order('published_at', { ascending: false })
    
    if (articlesData) setArticles(articlesData)
    setLoading(false)
  }
  
  const formatDate = (date) => {
    return format(new Date(date), 'PP', {
      locale: lang === 'bn' ? bn : undefined
    })
  }
  
  const categoryNames = {
    bn: {
      politics: 'রাজনীতি',
      technology: 'প্রযুক্তি',
      business: 'বাণিজ্য',
      sports: 'খেলা',
      entertainment: 'বিনোদন',
    },
    en: {
      politics: 'Politics',
      technology: 'Technology',
      business: 'Business',
      sports: 'Sports',
      entertainment: 'Entertainment',
    }
  }
  
  const categoryName = categoryNames[lang]?.[slug] || slug
  
  if (loading) return <LoadingSpinner />
  
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
          {articles.map(article => (
            <article key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
              {article.featured_image && (
                <div className="h-48 relative">
                  <Image
                    src={article.featured_image}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <Link href={`/${lang}/article/${article.id}`}>
                  <h2 className={`text-xl font-bold mb-2 hover:text-red-600 transition ${lang === 'bn' ? 'font-bangla' : ''}`}>
                    {lang === 'bn' && article.title_bn ? article.title_bn : article.title}
                  </h2>
                </Link>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {lang === 'bn' && article.excerpt_bn ? article.excerpt_bn : article.excerpt}
                </p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{article.author}</span>
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