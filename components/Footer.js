'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  MapPin,
  ChevronUp,
  Loader2,
  Check,
  Sparkles,
  Cpu,
} from 'lucide-react'
import { FICTITIOUS_EDITORIAL_TEAM, EDITORIAL_CONTACTS } from '@/lib/brandConfig'

export default function Footer({ lang = 'bn' }) {
  const isBangla = lang === 'bn'

  const content = {
    bn: {
      about: 'আমাদের সম্পর্কে',
      contact: 'যোগাযোগ',
      privacy: 'গোপনীয়তা নীতি',
      terms: 'শর্তাবলী',
      advertise: 'বিজ্ঞাপন ও পার্টনারশিপ',
      disclaimer: 'ডিসক্লেইমার',
      editorial: 'সম্পাদকীয় দর্শন',
      subscribe: 'নিউজলেটার সাবস্ক্রাইব',
      subscribeHint: 'ফ্যাশন, ওয়্যারেবল টেক ও আধুনিক লাইফস্টাইলের নিয়মিত আপডেট',
      emailPlaceholder: 'আপনার ইমেইল দিন',
      subscribeSuccess: 'ধন্যবাদ! আপনি সফলভাবে সাবস্ক্রাইব করেছেন।',
      subscribeError: 'অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা দিন।',
      subscribeLoading: 'পাঠানো হচ্ছে…',
      follow: 'সামাজিক মাধ্যমে যুক্ত থাকুন',
      quickLinks: 'প্রয়োজনীয় লিংক',
      contactUs: 'যোগাযোগের ঠিকানা',
      tagline: 'দৈনিক অভিমত: ফ্যাশন, আধুনিক প্রযুক্তি ও সমকালীন লাইফস্টাইল।',
      editor: `প্রধান সম্পাদক: ${FICTITIOUS_EDITORIAL_TEAM.editorInChief.name_bn} · ডিজাইন ও টেকনোলজি ল্যাব`,
      copyright: 'স্বত্ব © {year} দৈনিক অভিমত (Doinik Obhimot) · সর্বস্বত্ব সংরক্ষিত',
    },
    en: {
      about: 'About Us',
      contact: 'Contact',
      privacy: 'Privacy Policy',
      terms: 'Terms of Use',
      advertise: 'Advertise & Partnerships',
      disclaimer: 'Disclaimer',
      editorial: 'Editorial Mission',
      subscribe: 'Subscribe to Newsletter',
      subscribeHint: 'Regular dispatches on modern fashion, tech, and cultural lifestyle',
      emailPlaceholder: 'Enter your email',
      subscribeSuccess: 'Thank you! You are now subscribed to Doinik Obhimot.',
      subscribeError: 'Please enter a valid email address.',
      subscribeLoading: 'Sending…',
      follow: 'Connect With Us',
      quickLinks: 'Quick Links',
      contactUs: 'Design Ateliers',
      tagline: 'Daily perspectives on modern fashion, innovation & lifestyle.',
      editor: `Editor-in-Chief: ${FICTITIOUS_EDITORIAL_TEAM.editorInChief.name_en} · TechCouture Innovation Lab`,
      copyright: 'Copyright © {year} Doinik Obhimot · All rights reserved',
    },
  }

  const t = content[lang] || content.bn
  const fontClass = isBangla ? 'font-bangla' : 'font-latin'

  const quickLinks = [
    { href: `/${lang}/about`, label: t.about },
    { href: `/${lang}/contact`, label: t.contact },
    { href: `/${lang}/advertise`, label: t.advertise },
    { href: `/${lang}/privacy-policy`, label: t.privacy },
    { href: `/${lang}/terms`, label: t.terms },
    { href: `/${lang}/disclaimer`, label: t.disclaimer },
    { href: `/${lang}/editorial-policy`, label: t.editorial },
  ]

  const socials = [
    { href: '#', label: 'Instagram', Icon: Instagram, hover: 'hover:text-pink-400' },
    { href: '#', label: 'Twitter', Icon: Twitter, hover: 'hover:text-cyan-400' },
    { href: '#', label: 'YouTube', Icon: Youtube, hover: 'hover:text-red-400' },
    { href: '#', label: 'Facebook', Icon: Facebook, hover: 'hover:text-blue-400' },
  ]

  const [showTop, setShowTop] = useState(false)
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const [email, setEmail] = useState('')
  const [subStatus, setSubStatus] = useState('idle')

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSubStatus('error')
      return
    }
    setSubStatus('loading')
    setTimeout(() => {
      setSubStatus('success')
      setEmail('')
    }, 800)
  }

  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-stone-900 text-stone-300 font-sans border-t border-stone-800">
      {/* Main Footer Container */}
      <div className="container-custom max-w-screen-xl py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Col 1: Brand Info (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Link href={`/${lang}`} className="inline-flex items-center gap-2 group">
              <span className="text-2xl font-serif font-black tracking-tight text-white group-hover:text-teal-400 transition">
                {isBangla ? 'দৈনিক অভিমত' : 'Doinik Obhimot'}
              </span>
              <span className="text-[10px] font-mono font-bold bg-stone-800 text-teal-300 border border-stone-700 px-2 py-0.5 rounded tracking-wider uppercase">
                {isBangla ? 'সম্পাদকীয় ও স্টাইল' : 'EDITORIAL & STYLE'}
              </span>
            </Link>

            <p className={`text-stone-400 text-sm leading-relaxed max-w-md ${fontClass}`}>
              {t.tagline}
            </p>

            <div className="pt-2 text-xs text-stone-500 space-y-1">
              <p className="flex items-center gap-2">
                <MapPin size={14} className="text-cyan-500 shrink-0" />
                <span>{isBangla ? EDITORIAL_CONTACTS.address_bn : EDITORIAL_CONTACTS.address_en}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail size={14} className="text-cyan-500 shrink-0" />
                <a href={`mailto:${EDITORIAL_CONTACTS.email}`} className="hover:text-cyan-400 transition">
                  {EDITORIAL_CONTACTS.email}
                </a>
              </p>
            </div>

            <div className="pt-3 flex items-center gap-3">
              {socials.map((s) => {
                const Icon = s.Icon
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className={`w-9 h-9 rounded-full bg-stone-800 text-stone-300 flex items-center justify-center transition border border-stone-700/60 ${s.hover}`}
                  >
                    <Icon size={16} />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Col 2: Navigation Links (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white flex items-center gap-2">
              <Cpu size={14} className="text-cyan-400" />
              <span>{t.quickLinks}</span>
            </h3>
            <ul className="space-y-2 text-sm text-stone-400">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-cyan-300 transition duration-150 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Newsletter (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white flex items-center gap-2">
              <Sparkles size={14} className="text-cyan-400" />
              <span>{t.subscribe}</span>
            </h3>
            <p className={`text-xs text-stone-400 ${fontClass}`}>
              {t.subscribeHint}
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (subStatus !== 'idle') setSubStatus('idle')
                  }}
                  placeholder={t.emailPlaceholder}
                  className="bg-stone-800 text-stone-100 placeholder-stone-500 text-sm px-3.5 py-2.5 rounded-lg border border-stone-700 focus:outline-none focus:border-cyan-500 flex-1 transition"
                />
                <button
                  type="submit"
                  disabled={subStatus === 'loading'}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition shrink-0 flex items-center justify-center min-w-[70px]"
                >
                  {subStatus === 'loading' ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : subStatus === 'success' ? (
                    <Check size={16} />
                  ) : (
                    <span>{isBangla ? 'যুক্ত হোন' : 'Join'}</span>
                  )}
                </button>
              </div>

              {subStatus === 'success' && (
                <p className="text-xs text-emerald-400 flex items-center gap-1.5 pt-1">
                  <Check size={12} /> {t.subscribeSuccess}
                </p>
              )}
              {subStatus === 'error' && (
                <p className="text-xs text-rose-400 pt-1">
                  {t.subscribeError}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-stone-800 text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>{t.copyright.replace('{year}', currentYear)}</p>
          <p className="text-stone-400 font-medium">
            {t.editor}
          </p>
        </div>
      </div>

      {/* Floating Scroll to top */}
      {showTop && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 w-11 h-11 bg-stone-800/90 text-cyan-400 rounded-full flex items-center justify-center border border-stone-700 shadow-lg hover:bg-cyan-600 hover:text-white transition duration-200 z-40 backdrop-blur"
        >
          <ChevronUp size={20} />
        </button>
      )}
    </footer>
  )
}
