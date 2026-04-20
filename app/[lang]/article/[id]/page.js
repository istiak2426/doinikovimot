import { supabase } from '@/lib/supabase'
import DynamicArticleClient from './DynamicArticleClient'

// 🔥 IMPORTANT (OG FIX)
export async function generateMetadata({ params }) {
  const { id, lang } = params

  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single()

  if (!data) return { title: 'Article Not Found' }

  const isBn = lang === 'bn'

  const title = (isBn && data.title_bn) || data.title
  const description = (isBn && data.excerpt_bn) || data.excerpt
  const image = data.featured_image

  return {
    title: `${title} | Doinik Obhimot`,
    description,

    openGraph: {
      title,
      description,
      images: [image],
      type: 'article',
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

// 🔥 SERVER RENDER
export default async function Page({ params }) {
  const { id } = params

  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single()

  return <DynamicArticleClient initialArticle={data} />
}