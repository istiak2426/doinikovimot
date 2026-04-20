import { supabase } from '@/lib/supabase'
import DynamicArticleClient from './DynamicArticleClient'

// 🔥 Facebook / SEO (Prothom Alo style preview)
export async function generateMetadata({ params }) {
  const { id, lang } = params

  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single()

  if (!data) {
    return { title: 'Article Not Found' }
  }

  const isBn = lang === 'bn'

  const title =
    (isBn && data.title_bn) || data.title || 'Article'

  const description =
    (isBn && data.excerpt_bn) || data.excerpt || 'Read more'

  const image =
    data.featured_image ||
    'https://via.placeholder.com/1200x630.png?text=Doinik+Obhimot'

  const url = `https://doinikobhimot.vercel.app/${lang}/article/${id}`

  return {
    title: `${title} | Doinik Obhimot`,
    description,

    openGraph: {
      title,
      description,
      url,
      siteName: 'Doinik Obhimot',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
        },
      ],
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

// 🔥 Page render (server → client)
export default async function Page({ params }) {
  const { id } = params

  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single()

  return <DynamicArticleClient initialArticle={data} />
}