'use client'

import { useState, useEffect } from 'react'
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
} from 'lucide-react'
import LanguageSwitcher from './LanguageSwitcher'
import { supabase } from '@/lib/supabase'

const FALLBACK_CATEGORIES = [
  { slug: 'opinion', name_bn: 'সম্পাদকীয় ও অভিমত', name_en: 'Editorial & Opinion' },
  { slug: 'smart-fashion', name_bn: 'স্মার্ট ফ্যাশন', name_en: 'Smart Fashion' },
  { slug: 'wearables', name_bn: 'ওয়্যারেবলস', name_en: 'Wearables' },
  { slug: 'techwear', name_bn: 'আরবান টেকওয়্যার', name_en: 'Urban Techwear' },
  { slug: 'digital-couture', name_bn: 'ডিজিটাল ক্যুট্যুর', name_en: 'Digital Couture' },
  { slug: 'style-satire', name_bn: 'রসবোধ ও স্যাটায়ার', name_en: 'Culture Satire' },
]

export default function Header({ propLang }) {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const lang = propLang || params?.lang || 'bn'
  const isBn = lang === 'bn'

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categories] = useState(FALLBACK_CATEGORIES)

  useEffect(() => {
    checkUser()

    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  async function checkUser() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.refresh()
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    router.push(`/${lang}/search?q=${encodeURIComponent(searchQuery.trim())}`)
    setIsMenuOpen(false)
  }

  const closeMenu = () => setIsMenuOpen(false)
  const isActive = (href) => pathname === href

  return (
    <>
      <header
        className={`bg-[#FAF8F5]/95 backdrop-blur-md sticky top-0 z-50 transition-all duration-300 border-b ${
          scrolled ? 'shadow-xs border-stone-300/80' : 'border-stone-200/80'
        }`}
      >
        <div className="container-custom max-w-screen-xl">
          <div className="grid grid-cols-[auto_1fr_auto] items-center py-3.5 gap-6">
            
            {/* === Left: Brand Identity === */}
            <Link
              href={`/${lang}`}
              className="group flex flex-col justify-self-start transition"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl font-serif font-black tracking-tight text-stone-900 group-hover:text-teal-900 transition">
                  {isBn ? 'দৈনিক অভিমত' : 'Doinik Obhimot'}
                </span>
                <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200/70 px-2 py-0.5 rounded uppercase tracking-wider">
                  {isBn ? 'সম্পাদকীয় ও স্টাইল' : 'EDITORIAL & STYLE'}
                </span>
              </div>
              <span className="text-[10px] md:text-xs text-stone-500 font-medium tracking-tight mt-0.5 font-serif">
                {isBn
                  ? 'দৈনিক অভিমত: ফ্যাশন, আধুনিক প্রযুক্তি ও সমকালীন লাইফস্টাইল'
                  : 'Daily Perspectives on Fashion, Innovation & Modern Lifestyle'}
              </span>
            </Link>

            {/* === Center: Clean Editorial Navigation === */}
            <nav className="hidden lg:flex items-center justify-center gap-1">
              <Link
                href={`/${lang}`}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  isActive(`/${lang}`)
                    ? 'text-teal-900 font-semibold bg-teal-50/90'
                    : 'text-stone-700 hover:text-teal-800 hover:bg-stone-100/70'
                } ${isBn ? 'font-bangla' : ''}`}
              >
                {isBn ? 'হোম' : 'Home'}
              </Link>

              {categories.map((cat) => {
                const href = `/${lang}/category/${cat.slug}`
                return (
                  <Link
                    key={cat.slug}
                    href={href}
                    className={`px-3 py-1.5 rounded-lg text-sm transition whitespace-nowrap ${
                      isActive(href)
                        ? 'text-teal-900 font-semibold bg-teal-50/90'
                        : 'text-stone-700 hover:text-teal-800 hover:bg-stone-100/70'
                    } ${isBn ? 'font-bangla' : ''}`}
                  >
                    {isBn ? cat.name_bn : cat.name_en}
                  </Link>
                )
              })}
            </nav>

            {/* === Right: Search, Language Switcher & Auth === */}
            <div className="hidden lg:flex items-center gap-2 justify-self-end">
              <Link
                href={`/${lang}/search`}
                className="p-2 hover:bg-stone-100 rounded-lg text-stone-600 hover:text-teal-900 transition"
                title={isBn ? 'অনুসন্ধান' : 'Search'}
                aria-label="Search"
              >
                <Search size={18} />
              </Link>

              <LanguageSwitcher currentLang={lang} />

              {!loading &&
                (user ? (
                  <div className="relative group">
                    <button className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-stone-100 rounded-lg transition text-stone-700 text-sm border border-stone-200">
                      <User size={16} />
                      <span className="truncate max-w-[100px]">{user.email?.split('@')[0]}</span>
                    </button>

                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-stone-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 py-1">
                      <Link
                        href={`/${lang}/admin`}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-stone-700 hover:bg-stone-50"
                      >
                        📊 {isBn ? 'ড্যাশবোর্ড' : 'Dashboard'}
                      </Link>
                      <Link
                        href={`/${lang}/admin/new-article`}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-stone-700 hover:bg-stone-50"
                      >
                        ✍️ {isBn ? 'নতুন আর্টিকেল' : 'New Article'}
                      </Link>
                      <hr className="my-1 border-stone-100" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-xs text-rose-700 hover:bg-rose-50"
                      >
                        🚪 {isBn ? 'লগআউট' : 'Logout'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link
                    href={`/${lang}/auth`}
                    className="bg-stone-900 text-stone-100 hover:bg-teal-900 px-3.5 py-1.5 rounded-lg transition text-xs font-medium"
                  >
                    {isBn ? 'সাইন ইন' : 'Sign In'}
                  </Link>
                ))}
            </div>

            {/* === Mobile Menu Button === */}
            <div className="flex lg:hidden items-center gap-2 justify-self-end">
              <Link
                href={`/${lang}/search`}
                className="p-2 hover:bg-stone-100 rounded-lg text-stone-700"
                aria-label="Search"
              >
                <Search size={18} />
              </Link>
              <LanguageSwitcher currentLang={lang} />
              <button
                className="p-2 hover:bg-stone-100 rounded-lg text-stone-700"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Menu"
              >
                {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Clean Mobile Drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
          isMenuOpen ? 'visible' : 'invisible pointer-events-none'
        }`}
      >
        <div
          className={`absolute inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeMenu}
        />

        <div
          className={`relative w-4/5 max-w-sm h-full bg-[#FAF8F5] shadow-2xl overflow-y-auto pb-24 ml-auto transition-transform duration-300 ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-4 border-b border-stone-200 flex items-center justify-between">
            <span className="font-serif font-black text-stone-900 text-lg">
              {isBn ? 'দৈনিক অভিমত' : 'Doinik Obhimot'}
            </span>
            <button onClick={closeMenu} className="p-1.5 text-stone-500 hover:text-stone-900" aria-label="Close menu">
              <X size={20} />
            </button>
          </div>

          {/* Mobile Search Input */}
          <form onSubmit={handleSearch} className="p-3 border-b border-stone-200/80 bg-white">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isBn ? 'সম্পাদকীয় অনুসন্ধান করুন…' : 'Search editorials…'}
                className="w-full pl-8 pr-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg outline-none focus:border-teal-800 focus:bg-white"
              />
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
            </div>
          </form>

          <nav className="p-4 space-y-1">
            <Link
              href={`/${lang}`}
              onClick={closeMenu}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                isActive(`/${lang}`)
                  ? 'bg-teal-50 text-teal-900 font-semibold'
                  : 'text-stone-700 hover:bg-stone-100'
              } ${isBn ? 'font-bangla' : ''}`}
            >
              <Home size={18} />
              <span>{isBn ? 'হোম' : 'Home'}</span>
            </Link>

            {categories.map((cat) => {
              const href = `/${lang}/category/${cat.slug}`
              return (
                <Link
                  key={cat.slug}
                  href={href}
                  onClick={closeMenu}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                    isActive(href)
                      ? 'bg-teal-50 text-teal-900 font-semibold'
                      : 'text-stone-700 hover:bg-stone-100'
                  } ${isBn ? 'font-bangla' : ''}`}
                >
                  <Newspaper size={18} />
                  <span>{isBn ? cat.name_bn : cat.name_en}</span>
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-stone-200 mt-4">
            {!loading && user ? (
              <div className="space-y-2">
                <p className="text-xs text-stone-500 truncate">{user.email}</p>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 bg-stone-200 text-stone-800 py-2 rounded-lg text-xs font-medium"
                >
                  <LogOut size={14} />
                  <span>{isBn ? 'লগআউট' : 'Logout'}</span>
                </button>
              </div>
            ) : (
              <Link
                href={`/${lang}/auth`}
                onClick={closeMenu}
                className="w-full flex items-center justify-center gap-2 bg-stone-900 text-white py-2.5 rounded-lg text-sm font-medium"
              >
                <LogIn size={16} />
                <span>{isBn ? 'সাইন ইন করুন' : 'Sign In'}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  )
}