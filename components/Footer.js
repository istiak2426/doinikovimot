'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  ChevronUp,
  Loader2,
  Check,
} from 'lucide-react'

export default function Footer({ lang = 'bn' }) {
  const content = {
    bn: {
      about: 'আমাদের সম্পর্কে',
      contact: 'যোগাযোগ',
      privacy: 'গোপনীয়তা নীতি',
      terms: 'শর্তাবলী',
      advertise: 'বিজ্ঞাপন',
      disclaimer: 'দাবিত্যাগ',
      editorial: 'সম্পাদকীয় নীতি',
      subscribe: 'সাবস্ক্রাইব',
      subscribeHint: 'নতুন সংবাদ সরাসরি আপনার ইমেইলে',
      emailPlaceholder: 'আপনার ইমেইল',
      subscribeSuccess: 'ধন্যবাদ! সাবস্ক্রিপশন নিশ্চিত হয়েছে।',
      subscribeError: 'অনুগ্রহ করে একটি বৈধ ইমেইল দিন।',
      subscribeLoading: 'পাঠানো হচ্ছে…',
      follow: 'আমাদের অনুসরণ করুন',
      quickLinks: 'দ্রুত লিংক',
      contactUs: 'যোগাযোগ করুন',
      tagline: 'সত্য ও নির্ভুল সংবাদে প্রতিশ্রুতিবদ্ধ। নির্ভেজাল সংবাদ সবার আগে।',
      editor: 'সম্পাদক ও প্রকাশক: আরিফ মারজান',
      copyright: 'স্বত্ব © {year} দৈনিক অভিমত',
    },
    en: {
      about: 'About Us',
      contact: 'Contact',
      privacy: 'Privacy Policy',
      terms: 'Terms of Use',
      advertise: 'Advertise',
      disclaimer: 'Disclaimer',
      editorial: 'Editorial Policy',
      subscribe: 'Subscribe',
      subscribeHint: 'Get the latest news straight to your inbox',
      emailPlaceholder: 'Your email',
      subscribeSuccess: 'Thank you! Your subscription is confirmed.',
      subscribeError: 'Please enter a valid email address.',
      subscribeLoading: 'Sending…',
      follow: 'Follow Us',
      quickLinks: 'Quick Links',
      contactUs: 'Contact Us',
      tagline: 'Committed to truth and accurate news. Unbiased news for everyone.',
      editor: 'Editor & Publisher: Arif Marjan',
      copyright: 'Copyright © {year} Doinik Obhimot',
    },
  }

  const t = content[lang] || content.bn
  const isBangla = lang === 'bn'
  const fontClass = isBangla ? 'font-bangla' : 'font-latin'

  // lang-prefixed route helper
  const p = (path) => `/${lang}${path}`

  // quick links — এক জায়গায় রেখে map করা হলো
  const quickLinks = [
    { href: '/about', label: t.about },
    { href: '/contact', label: t.contact },
    { href: '/advertise', label: t.advertise },
    { href: '/privacy-policy', label: t.privacy },
    { href: '/terms', label: t.terms },
    { href: '/disclaimer', label: t.disclaimer },
    { href: '/editorial-policy', label: t.editorial },
  ]

  // ---------- Scroll to top ----------
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ---------- Newsletter ----------
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error

  const handleSubscribe = async (e) => {
    e.preventDefault()
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    if (!valid) {
      setStatus('error')
      return
    }

    setStatus('loading')
    try {
      // 🔌 আপনার API endpoint এখানে বসান
      // await fetch('/api/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email: email.trim(), lang }),
      // })

      await new Promise((r) => setTimeout(r, 700)) // ডেমো delay
      setStatus('success')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  const currentYear = new Date().getFullYear()

  return (
    <>
      {/* Scroll to top */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label={isBangla ? 'উপরে যান' : 'Scroll to top'}
        className={`fixed bottom-4 right-4 md:bottom-8 md:right-8 z-40
          bg-red-600 text-white p-2.5 md:p-3 rounded-full shadow-lg
          hover:bg-red-700 active:scale-95 transition-all duration-200
          focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900
          ${showTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      >
        <ChevronUp size={20} className="md:w-6 md:h-6" aria-hidden="true" />
      </button>

      <footer lang={lang} className={`bg-gray-900 text-white mt-8 md:mt-16 ${fontClass}`}>
        <div className="container-custom py-8 md:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">

            {/* ---------- About ---------- */}
            <div>
              <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">
                {isBangla ? 'দৈনিক অভিমত' : 'Doinik Obhimot'}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {t.tagline}
              </p>

              <div className="flex space-x-1 mt-5">
                <a
                  href="https://www.facebook.com/doinikobhimot"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="p-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-white/5 transition
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  <Facebook size={18} aria-hidden="true" />
                </a>
                <a
                  href="#"
                  aria-label="Twitter"
                  className="p-2 rounded-lg text-gray-400 hover:text-sky-400 hover:bg-white/5 transition
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  <Twitter size={18} aria-hidden="true" />
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="p-2 rounded-lg text-gray-400 hover:text-pink-500 hover:bg-white/5 transition
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  <Instagram size={18} aria-hidden="true" />
                </a>
                <a
                  href="#"
                  aria-label="YouTube"
                  className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-white/5 transition
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  <Youtube size={18} aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* ---------- Quick Links ---------- */}
            <div>
              <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">
                {t.quickLinks}
              </h4>
              <ul className="space-y-1 text-gray-400 text-sm">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={p(link.href)}
                      className="inline-block py-1 hover:text-white transition
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ---------- Contact ---------- */}
            <div>
              <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">
                {t.contactUs}
              </h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="flex items-center gap-2">
                  <Phone size={14} className="shrink-0" aria-hidden="true" />
                  <a
                    href="tel:+8801683522917"
                    className="hover:text-white transition
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded"
                  >
                    +880 1683 522 917
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={14} className="shrink-0" aria-hidden="true" />
                  <a
                    href="mailto:doinikobhimot@gmail.com"
                    className="hover:text-white transition break-all
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded"
                  >
                    doinikobhimot@gmail.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin size={14} className="shrink-0" aria-hidden="true" />
                  <span>{isBangla ? 'ঢাকা, বাংলাদেশ' : 'Dhaka, Bangladesh'}</span>
                </li>
              </ul>
            </div>

            {/* ---------- Newsletter ---------- */}
            <div>
              <h4 className="font-semibold mb-2 text-sm md:text-base">{t.subscribe}</h4>
              <p className="text-gray-400 text-xs mb-3">{t.subscribeHint}</p>

              <form onSubmit={handleSubscribe} noValidate>
                <label htmlFor="footer-email" className="sr-only">
                  {t.emailPlaceholder}
                </label>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    id="footer-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (status !== 'idle') setStatus('idle')
                    }}
                    placeholder={t.emailPlaceholder}
                    aria-invalid={status === 'error'}
                    aria-describedby="footer-email-msg"
                    className={`flex-1 min-w-0 px-3 py-2 rounded-lg text-gray-900 text-sm
                      placeholder:text-gray-500 border
                      focus:outline-none focus:ring-2 focus:ring-red-500/60
                      ${status === 'error' ? 'border-red-500' : 'border-transparent'}`}
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="inline-flex items-center justify-center gap-1.5
                      bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700
                      active:scale-[.98] transition text-sm whitespace-nowrap
                      disabled:opacity-60 disabled:cursor-not-allowed
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                  >
                    {status === 'loading' && (
                      <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                    )}
                    {status === 'loading' ? t.subscribeLoading : t.subscribe}
                  </button>
                </div>

                {/* Live status message */}
                <p
                  id="footer-email-msg"
                  role="status"
                  aria-live="polite"
                  className={`mt-2 text-xs min-h-[1rem] flex items-center gap-1
                    ${status === 'success' ? 'text-green-400' : ''}
                    ${status === 'error' ? 'text-red-400' : ''}
                    ${status === 'loading' ? 'text-gray-400' : ''}`}
                >
                  {status === 'success' && (
                    <>
                      <Check size={12} aria-hidden="true" /> {t.subscribeSuccess}
                    </>
                  )}
                  {status === 'error' && t.subscribeError}
                  {status === 'loading' && t.subscribeLoading}
                </p>
              </form>
            </div>
          </div>

          {/* ---------- Bottom bar ---------- */}
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400 text-xs md:text-sm space-y-1">
            <p>{t.editor}</p>
            <p>{t.copyright.replace('{year}', currentYear)}</p>
          </div>
        </div>
      </footer>
    </>
  )
}
