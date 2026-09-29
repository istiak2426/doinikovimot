'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useParams, useRouter, usePathname } from 'next/navigation'
import {
  Menu,
  X,
  User,
  Search,
  Home,
  Newspaper,
  LogOut,
  LogIn,
  ChevronDown,
} from 'lucide-react'
import LanguageSwitcher from './LanguageSwitcher'
import { supabase } from '@/lib/supabase'

const FALLBACK_CATEGORIES = [
  { slug: 'national', name_bn: 'জাতীয়', name_en: 'National' },
  { slug: 'jobs', name_bn: 'চাকরি', name_en: 'Jobs' },
  { slug: 'economy', name_bn: 'অর্থনীতি', name_en: 'Economy' },
  { slug: 'lifestyle', name_bn: 'লাইফস্টাইল', name_en: 'Lifestyle' },
]

const VISIBLE_COUNT = 5

export default function Header({ propLang }) {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const lang = propLang || params?.lang || 'bn'

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES)
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef(null)

  const visibleCategories = categories.slice(0, VISIBLE_COUNT)
  const moreCategories = categories.slice(VISIBLE_COUNT)

  useEffect(() => {
    checkUser()
    fetchCategories()

    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)

    if (isMenuOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'

    const handleClickOutside = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  async function checkUser() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    } catch (error) {
      console.error('Error checking user:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  async function fetchCategories() {
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (!url || !key) return

      const res = await fetch(
        `${url}/rest/v1/categories?select=slug,name_bn,name_en&order=name_en.asc`,
        {
          headers: { apikey: key, Authorization: `Bearer ${key}` },
        }
      )
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) setCategories(data)
    } catch (err) {
      console.warn('categories fetch crashed:', err.message)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsMenuOpen(false)
    router.push(`/${lang}`)
    router.refresh()
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/${lang}/search?q=${encodeURIComponent(searchQuery)}`)
      setIsMenuOpen(false)
      setSearchQuery('')
    }
  }

  const closeMenu = () => setIsMenuOpen(false)
  const isActive = (href) => pathname === href

  return (
    <>
      <header
        className={`bg-white sticky top-0 z-50 transition-all duration-300 border-b ${
          scrolled ? 'shadow-md border-transparent' : 'border-gray-200'
        }`}
      >
        <div className="container-custom">
          {/* 3-column grid: logo | nav (center) | icons */}
          <div className="grid grid-cols-[auto_1fr_auto] items-center py-3 md:py-4 gap-4">
            {/* === Left: Logo === */}
            <Link
              href={`/${lang}`}
              className="text-2xl md:text-3xl font-bold text-red-600 hover:text-red-700 transition justify-self-start"
              style={{ lineHeight: '1.3' }}
            >
              {lang === 'bn' ? 'দৈনিক অভিমত' : 'Doinik Obhimot'}
            </Link>

            {/* === Center: Navigation (centered) === */}
            <nav className="hidden lg:flex items-center justify-center gap-1">
              <Link
                href={`/${lang}`}
                className={`px-3 py-2 rounded-md text-sm transition ${
                  isActive(`/${lang}`)
                    ? 'text-red-600 font-semibold bg-red-50'
                    : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                } ${lang === 'bn' ? 'font-bangla' : ''}`}
              >
                {lang === 'bn' ? 'হোম' : 'Home'}
              </Link>

              {visibleCategories.map((cat) => {
                const href = `/${lang}/category/${cat.slug}`
                return (
                  <Link
                    key={cat.slug}
                    href={href}
                    className={`px-3 py-2 rounded-md text-sm transition whitespace-nowrap ${
                      isActive(href)
                        ? 'text-red-600 font-semibold bg-red-50'
                        : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                    } ${lang === 'bn' ? 'font-bangla' : ''}`}
                  >
                    {lang === 'bn' ? cat.name_bn : cat.name_en}
                  </Link>
                )
              })}

              {moreCategories.length > 0 && (
                <div className="relative" ref={moreRef}>
                  <button
                    onClick={() => setMoreOpen((v) => !v)}
                    className={`px-3 py-2 rounded-md text-sm transition flex items-center gap-1 whitespace-nowrap ${
                      moreOpen
                        ? 'text-red-600 bg-red-50'
                        : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                    } ${lang === 'bn' ? 'font-bangla' : ''}`}
                  >
                    {lang === 'bn' ? 'আরও' : 'More'}
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${
                        moreOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {moreOpen && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                      {moreCategories.map((cat) => {
                        const href = `/${lang}/category/${cat.slug}`
                        return (
                          <Link
                            key={cat.slug}
                            href={href}
                            onClick={() => setMoreOpen(false)}
                            className={`block px-4 py-2 text-sm transition ${
                              isActive(href)
                                ? 'text-red-600 bg-red-50 font-semibold'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-red-600'
                            } ${lang === 'bn' ? 'font-bangla' : ''}`}
                          >
                            {lang === 'bn' ? cat.name_bn : cat.name_en}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </nav>

            {/* === Right: Icons / User === */}
            <div className="hidden lg:flex items-center gap-1 justify-self-end">
              <button className="p-2 hover:bg-gray-100 rounded-full transition">
                <Search size={18} />
              </button>
              <LanguageSwitcher currentLang={lang} />

              {!loading &&
                (user ? (
                  <div className="relative group">
                    <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-full transition">
                      <User size={18} />
                      <span className="text-sm hidden xl:inline">
                        {user.email?.split('@')[0]}
                      </span>
                    </button>

                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-1">
                        <Link
                          href={`/${lang}/admin`}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          📊 {lang === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}
                        </Link>
                        <Link
                          href={`/${lang}/admin/new-article`}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          ✍️ {lang === 'bn' ? 'নতুন আর্টিকেল' : 'New Article'}
                        </Link>
                        <Link
                          href={`/${lang}/admin/categories`}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          🗂️ {lang === 'bn' ? 'ক্যাটাগরি' : 'Categories'}
                        </Link>
                        <hr className="my-1" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                        >
                          🚪 {lang === 'bn' ? 'লগআউট' : 'Logout'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    href={`/${lang}/auth`}
                    className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition text-sm"
                  >
                    {lang === 'bn' ? 'সাইন ইন' : 'Sign In'}
                  </Link>
                ))}
            </div>

            {/* === Mobile menu button === */}
            <div className="flex lg:hidden items-center gap-1 justify-self-end col-start-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Search size={20} />
              </button>
              <button
                className="p-2 hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile slide-in menu */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
          }`}
          onClick={closeMenu}
        />

        <div className="relative w-4/5 max-w-sm h-full bg-white shadow-xl overflow-y-auto pb-32 ml-auto">
          <div className="p-4 border-b bg-gray-50 sticky top-0 z-10">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'bn' ? 'খুঁজুন...' : 'Search...'}
                className="w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
              <button
                type="submit"
                className="absolute right-2 top-1.5 px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
              >
                {lang === 'bn' ? 'খুঁজুন' : 'Go'}
              </button>
            </form>
          </div>

          <div className="p-4 border-b bg-gradient-to-r from-red-50 to-orange-50">
            {!loading && user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">
                      {user.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:bg-red-100 p-2 rounded-lg flex-shrink-0"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  {lang === 'bn'
                    ? 'সংবাদ পড়তে লগইন করুন'
                    : 'Login to read news'}
                </p>
                <Link
                  href={`/${lang}/auth`}
                  className="flex items-center justify-center gap-2 w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  onClick={closeMenu}
                >
                  <LogIn size={18} />
                  {lang === 'bn' ? 'সাইন ইন করুন' : 'Sign In'}
                </Link>
              </div>
            )}
          </div>

          <div className="p-4 border-b">
            <p className="text-xs text-gray-500 uppercase mb-2 tracking-wider">
              {lang === 'bn' ? 'ভাষা' : 'Language'}
            </p>
            <LanguageSwitcher currentLang={lang} />
          </div>

          <nav className="p-4 space-y-1">
            <Link
              href={`/${lang}`}
              onClick={closeMenu}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition ${
                isActive(`/${lang}`)
                  ? 'bg-red-50 text-red-600 font-semibold'
                  : 'hover:bg-gray-100'
              } ${lang === 'bn' ? 'font-bangla' : ''}`}
            >
              <Home size={20} className="flex-shrink-0" />
              <span>{lang === 'bn' ? 'হোম' : 'Home'}</span>
            </Link>

            {categories.map((cat) => {
              const href = `/${lang}/category/${cat.slug}`
              return (
                <Link
                  key={cat.slug}
                  href={href}
                  onClick={closeMenu}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition ${
                    isActive(href)
                      ? 'bg-red-50 text-red-600 font-semibold'
                      : 'hover:bg-gray-100'
                  } ${lang === 'bn' ? 'font-bangla' : ''}`}
                >
                  <Newspaper size={20} className="flex-shrink-0" />
                  <span>{lang === 'bn' ? cat.name_bn : cat.name_en}</span>
                </Link>
              )
            })}
          </nav>

          {user && (
            <div className="p-4 border-t mb-4">
              <p className="text-xs text-gray-500 uppercase mb-2 tracking-wider">
                {lang === 'bn' ? 'প্রশাসনিক এলাকা' : 'Admin Area'}
              </p>
              <Link
                href={`/${lang}/admin`}
                onClick={closeMenu}
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100"
              >
                📊 <span>{lang === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}</span>
              </Link>
              <Link
                href={`/${lang}/admin/new-article`}
                onClick={closeMenu}
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100"
              >
                ✍️ <span>{lang === 'bn' ? 'নতুন আর্টিকেল' : 'New Article'}</span>
              </Link>
              <Link
                href={`/${lang}/admin/categories`}
                onClick={closeMenu}
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100"
              >
                🗂️ <span>{lang === 'bn' ? 'ক্যাটাগরি ম্যানেজ' : 'Categories'}</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}