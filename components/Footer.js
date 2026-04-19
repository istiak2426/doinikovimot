'use client'

import Link from 'next/link'
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, ChevronUp } from 'lucide-react'

export default function Footer({ lang = 'bn' }) {

  const content = {
    bn: {
      about: 'আমাদের সম্পর্কে',
      contact: 'যোগাযোগ',
      privacy: 'গোপনীয়তা নীতি',
      terms: 'শর্তাবলী',
      advertise: 'বিজ্ঞাপন',
      subscribe: 'সাবস্ক্রাইব',
      follow: 'আমাদের অনুসরণ করুন',
      copyright: 'সর্বস্বত্ব সংরক্ষিত',
      quickLinks: 'দ্রুত লিংক',
      contactUs: 'যোগাযোগ করুন',
    },
    en: {
      about: 'About Us',
      contact: 'Contact',
      privacy: 'Privacy Policy',
      terms: 'Terms of Use',
      advertise: 'Advertise',
      subscribe: 'Subscribe',
      follow: 'Follow Us',
      copyright: 'All Rights Reserved',
      quickLinks: 'Quick Links',
      contactUs: 'Contact Us',
    }
  }

  const t = content[lang] || content.bn

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-gray-900 text-white mt-8 md:mt-16">

      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-4 right-4 md:bottom-8 md:right-8 bg-red-600 text-white p-2 md:p-3 rounded-full shadow-lg hover:bg-red-700 transition z-40"
        aria-label="Scroll to top"
      >
        <ChevronUp size={20} className="md:w-6 md:h-6" />
      </button>

      <div className="container-custom py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">

          {/* About Section */}
          <div>
            <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">
              {lang === 'bn' ? 'দৈনিক অভিমত' : 'Doinik Obhimot'}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {lang === 'bn'
                ? 'সত্য ও নির্ভুল সংবাদে প্রতিশ্রুতিবদ্ধ। নির্ভেজাল সংবাদ সবার আগে।'
                : 'Committed to truth and accurate news. Unbiased news for everyone.'}
            </p>

          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">{t.quickLinks}</h4>
            <ul className="space-y-2 text-gray-400 text-sm">

              <li>
                <Link href="/about" className="hover:text-white transition block py-1">
                  {t.about}
                </Link>
              </li>

              <li>
                <Link href="/contact" className="hover:text-white transition block py-1">
                  {t.contact}
                </Link>
              </li>

              <li>
                <Link href="/advertise" className="hover:text-white transition block py-1">
                  {t.advertise}
                </Link>
              </li>

              <li>
                <Link href="/privacy-policy" className="hover:text-white transition block py-1">
                  {t.privacy}
                </Link>
              </li>

              <li>
                <Link href="/terms" className="hover:text-white transition block py-1">
                  {t.terms}
                </Link>
              </li>

            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">{t.contactUs}</h4>
            <ul className="space-y-2 text-gray-400 text-sm">

              <li className="flex items-center gap-2">
                <Phone size={14} />
                <span>+8801748008483</span>
              </li>

              <li className="flex items-center gap-2">
                <Mail size={14} />
                <span>doinikovimot@gmail.com</span>
              </li>

              <li className="flex items-center gap-2">
                <MapPin size={14} />
                <span>Dhaka, Bangladesh</span>
              </li>

            </ul>
          </div>

          {/* Social & Newsletter */}
          <div>
            <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">{t.follow}</h4>

            <div className="flex space-x-3 md:space-x-4 mb-4 md:mb-6">

              <a href="https://www.facebook.com/doinikovimot" aria-label="Facebook" className="hover:text-blue-400 transition p-1">
                <Facebook size={18} className="md:w-5 md:h-5" />
              </a>

              <a href="#" aria-label="Twitter" className="hover:text-blue-400 transition p-1">
                <Twitter size={18} className="md:w-5 md:h-5" />
              </a>

              <a href="#" aria-label="Instagram" className="hover:text-pink-500 transition p-1">
                <Instagram size={18} className="md:w-5 md:h-5" />
              </a>

              <a href="#" aria-label="YouTube" className="hover:text-red-600 transition p-1">
                <Youtube size={18} className="md:w-5 md:h-5" />
              </a>

            </div>

            <div>
              <h4 className="font-semibold mb-2 text-sm">{t.subscribe}</h4>
              <div className="flex flex-col sm:flex-row gap-2">

                <input
                  type="email"
                  placeholder={lang === 'bn' ? 'আপনার ইমেইল' : 'Your email'}
                  className="flex-1 px-3 py-2 rounded-lg text-gray-900 text-sm"
                />

                <button className="bg-red-600 px-3 md:px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm whitespace-nowrap">
                  {lang === 'bn' ? 'সাবস্ক্রাইব' : 'Subscribe'}
                </button>

              </div>
            </div>

          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-gray-400 text-xs md:text-sm">
          <p>&copy; 2026 Doinik Obhimot. {t.copyright}</p>
        </div>
      </div>
    </footer>
  )
}
