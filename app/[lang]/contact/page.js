import { Mail, MapPin, Phone, ShieldCheck } from 'lucide-react'
import { FICTITIOUS_EDITORIAL_TEAM, EDITORIAL_CONTACTS } from '@/lib/brandConfig'

export const metadata = {
  title: 'Contact · Doinik Obhimot (দৈনিক অভিমত)',
  description: 'Connect with the editorial team at Doinik Obhimot',
}

export default function Contact({ params }) {
  const isBn = !params || params.lang === 'bn'

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-12 text-stone-900 font-sans">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xs border border-stone-200/90 space-y-8">
          
          <div className="border-b border-stone-200/80 pb-5 space-y-1.5">
            <span className="text-xs font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200/80 px-2.5 py-0.5 rounded-full uppercase">
              EDITORIAL & PRESS
            </span>
            <h1 className="text-2xl md:text-3xl font-serif font-black text-stone-900">
              {isBn ? 'যোগাযোগ করুন' : 'Contact Ateliers'}
            </h1>
            <p className="text-stone-500 text-sm">
              {isBn
                ? 'স্মার্ট ফ্যাশন, ওয়্যারেবল টেকনোলজি আইডিয়া বা সহযোগিতার জন্য আমাদের লিখুন।'
                : 'Get in touch for editorial pitches, fashion-tech inquiries, or brand collaborations.'}
            </p>
          </div>

          <div className="bg-stone-50 p-5 rounded-xl border border-stone-200/80 space-y-3 text-sm text-stone-700">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-stone-900 min-w-[70px] text-xs font-mono uppercase">
                {isBn ? 'দায়িত্বে:' : 'In Charge:'}
              </span>
              <span>
                {isBn
                  ? `${FICTITIOUS_EDITORIAL_TEAM.editorInChief.name_bn} (${FICTITIOUS_EDITORIAL_TEAM.editorInChief.title_bn})`
                  : `${FICTITIOUS_EDITORIAL_TEAM.editorInChief.name_en} (${FICTITIOUS_EDITORIAL_TEAM.editorInChief.title_en})`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-semibold text-stone-900 min-w-[70px] text-xs font-mono uppercase">
                {isBn ? 'ইমেইল:' : 'Email:'}
              </span>
              <a href={`mailto:${EDITORIAL_CONTACTS.email}`} className="text-teal-800 hover:underline font-mono text-xs">
                {EDITORIAL_CONTACTS.email}
              </a>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-semibold text-stone-900 min-w-[70px] text-xs font-mono uppercase">
                {isBn ? 'ঠিকানা:' : 'Studio:'}
              </span>
              <span className="text-stone-600 text-xs">
                {isBn ? EDITORIAL_CONTACTS.address_bn : EDITORIAL_CONTACTS.address_en}
              </span>
            </div>
          </div>

          <form
            action={`mailto:${EDITORIAL_CONTACTS.email}`}
            method="POST"
            className="space-y-4"
          >
            {/* Honeypot spam protection */}
            <div className="hidden">
              <label htmlFor="_gotcha">Don&apos;t fill this</label>
              <input type="text" id="_gotcha" name="_gotcha" tabIndex={-1} autoComplete="off" />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide">
                {isBn ? 'আপনার নাম' : 'Your Name'}
              </label>
              <input
                type="text"
                name="name"
                placeholder={isBn ? 'নাম লিখুন' : 'Full Name'}
                required
                className="w-full border border-stone-300 px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-teal-700 focus:border-teal-700 outline-none transition text-sm bg-stone-50/50"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide">
                {isBn ? 'আপনার ইমেইল' : 'Your Email'}
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@domain.com"
                required
                className="w-full border border-stone-300 px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-teal-700 focus:border-teal-700 outline-none transition text-sm bg-stone-50/50"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide">
                {isBn ? 'বার্তা বা ফ্যাশন-টেক আইডিয়া' : 'Message or Pitch'}
              </label>
              <textarea
                name="message"
                placeholder={isBn ? 'আপনার বার্তা এখানে লিখুন...' : 'Share your inquiry or project details...'}
                className="w-full border border-stone-300 px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-teal-700 focus:border-teal-700 outline-none transition text-sm bg-stone-50/50"
                rows={4}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-stone-900 hover:bg-teal-900 text-white font-medium px-4 py-3 rounded-xl transition duration-200 text-sm shadow-xs"
            >
              {isBn ? 'বার্তা পাঠান' : 'Send Message'}
            </button>

            <p className="text-xs text-stone-400 text-center flex items-center justify-center gap-1.5 pt-2">
              <ShieldCheck size={14} className="text-teal-700" />
              <span>{isBn ? 'আপনার বার্তা নিরাপদে সম্পাদকীয় টিমের কাছে পৌঁছাবে।' : 'Encrypted & delivered directly to our editorial inbox.'}</span>
            </p>
          </form>

        </div>
      </div>
    </div>
  )
}