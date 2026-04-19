'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthPage({ params: { lang } }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (!error) router.push(`/${lang}/admin`)
      else alert(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (!error) alert('Check your email for verification!')
      else alert(error.message)
    }
    
    setLoading(false)
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? (lang === 'bn' ? 'সাইন ইন' : 'Sign In') : (lang === 'bn' ? 'সাইন আপ' : 'Sign Up')}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {loading ? 'Loading...' : (isLogin ? (lang === 'bn' ? 'সাইন ইন' : 'Sign In') : (lang === 'bn' ? 'সাইন আপ' : 'Sign Up'))}
            </button>
          </div>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-red-600 hover:text-red-500"
            >
              {isLogin ? (lang === 'bn' ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : 'Create new account') : (lang === 'bn' ? 'ইতিমধ্যে অ্যাকাউন্ট আছে?' : 'Already have an account?')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}