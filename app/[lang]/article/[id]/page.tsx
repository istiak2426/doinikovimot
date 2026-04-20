import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Calendar, Eye, User, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import { bn } from 'date-fns/locale'

type Props = {
  params: { lang: string; id: string }
}

export async function generateMetadata({ params }: Props) {
  const supabase = createClient()
  const { data: article } = await supabase
    .from('articles')
    .select('title, title_bn, excerpt, excerpt_bn, featured_image')
    .eq('id', params.id)
    .eq('status', 'published')
    .single()
  
  if (!article) return { title: 'Doinik Obhimot' }
  
  const isBn = params.lang === 'bn'
  const title = isBn && article.title_bn ? article.title_bn : article.title
  const desc = isBn && article.excerpt_bn ? article.excerpt_bn : article.excerpt
  
  return {
    title: `${title} | Doinik Obhimot`,
    description: desc,
    openGraph: {
      title, description: desc,
      images: article.featured_image ? [article.featured_image] : [],
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title, description: desc, images: article.featured_image ? [article.featured_image] : [] },
  }
}

export default async function ArticlePage({ params }: Props) {
  const supabase = createClient()
  const { data: article, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', params.id)
    .eq('status', 'published')
    .single()
  
  if (error || !article) notFound()
  
  const isBn = params.lang === 'bn'
  const title = isBn && article.title_bn ? article.title_bn : article.title
  const content = isBn && article.content_bn ? article.content_bn : article.content
  const excerpt = isBn && article.excerpt_bn ? article.excerpt_bn : article.excerpt
  
  supabase.from('articles').update({ views: (article.views || 0) + 1 }).eq('id', params.id).then()
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Link href={`/${params.lang}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 mb-6">
        <ArrowLeft size={20} /> {isBn ? 'হোমে ফিরুন' : 'Back'}
      </Link>
      
      <article className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">{title}</h1>
        <div className="flex gap-4 text-gray-600 border-t border-b py-4 mb-6">
          <span className="flex items-center gap-1"><User size={16} /> {article.author || 'Doinik Obhimot'}</span>
          <span className="flex items-center gap-1"><Calendar size={16} /> {format(new Date(article.published_at), 'PPP')}</span>
          <span className="flex items-center gap-1"><Eye size={16} /> {article.views || 0}</span>
        </div>
        
        {article.featured_image && (
          <img src={article.featured_image} alt={title} className="w-full h-auto rounded-lg mb-6" />
        )}
        
        {excerpt && <p className="text-xl italic border-l-4 border-red-500 pl-4 mb-6">{excerpt}</p>}
        
        <div dangerouslySetInnerHTML={{ __html: content }} className="prose max-w-none" />
        
        <button onClick={() => navigator.share?.({ title, url: window.location.href }) || alert('Link copied')} 
          className="mt-8 bg-red-600 text-white px-6 py-2 rounded-lg">
          {isBn ? 'শেয়ার করুন' : 'Share'}
        </button>
      </article>
    </div>
  )
}