'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback({ params: { lang } }) {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push(`/${lang || 'bn'}/admin`)
      } else {
        router.push(`/${lang || 'bn'}`)
      }
    }).catch(() => {
      router.push(`/${lang || 'bn'}`)
    })
  }, [router, lang])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-stone-600 font-medium text-sm">
        {lang === 'bn' ? 'ভেরিফাই করা হচ্ছে...' : 'Verifying...'}
      </div>
    </div>
  )
}
