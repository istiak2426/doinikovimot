import Link from 'next/link'
import { Cpu, Sparkles, Shirt, Layers, Check } from 'lucide-react'
import { FICTITIOUS_EDITORIAL_TEAM, EDITORIAL_CONTACTS } from '@/lib/brandConfig'

export default function About({ params }) {
  const isBn = !params || params.lang === 'bn'
  const lang = params?.lang || 'bn'

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-12 text-stone-900 font-sans">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xs border border-stone-200/90 space-y-8">
          
          {/* Header */}
          <div className="border-b border-stone-200/80 pb-6 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200/80 px-2.5 py-0.5 rounded-full uppercase">
                FASHION × TECHWEAR
              </span>
            </div>
            <h1 className="text-3xl font-serif font-black text-stone-900">
              {isBn ? 'আমাদের সম্পর্কে · দৈনিক অভিমত' : 'About Us · Doinik Obhimot'}
            </h1>
            <p className="text-stone-500 text-sm font-medium">
              {isBn
                ? 'ফ্যাশন, ওয়্যারেবল টেকনোলজি ও আধুনিক লাইফস্টাইলের দ্বিভাষিক বিশেষ প্রকাশনা — দৈনিক অভিমত'
                : 'A bilingual publication dedicated to modern lifestyle, fashion innovation, wearable tech, and contemporary perspectives.'}
            </p>
          </div>

          {/* Editorial Mission */}
          <div className="space-y-4 text-stone-700 leading-relaxed text-sm md:text-base">
            <p>
              {isBn
                ? 'দৈনিক অভিমত (Doinik Obhimot) হলো সমকালীন সমাজ, আধুনিক প্রযুক্তি ও ফ্যাশন সংস্কৃতির এক উন্মুক্ত মুক্তমঞ্চ। আমরা হার্ডওয়্যার ও ওয়্যারেবল উদ্ভাবন, আরামদায়ক পোশাক শৈলী এবং বৈশ্বিক জীবনধারার নান্দনিকতাকে একসাথে এনে তরুণ প্রজন্ম ও চিন্তাশীল পাঠকদের জন্য নতুন দৃষ্টিভঙ্গি উপস্থাপন করি।'
                : 'Doinik Obhimot operates at the intersection of contemporary perspectives, wearable innovation, and lifestyle aesthetics. From smart textiles to urban ergonomics and digital culture, we curate thoughtful daily reflections for modern readers.'}
            </p>

            <p>
              {isBn
                ? 'আমরা বিশ্বাস করি ফ্যাশন ও প্রযুক্তি কেবল প্রদর্শন নয়; এটি সুস্থ জীবনযাপন, ব্যবহারিক বিজ্ঞান এবং ব্যক্তিগত আত্মপ্রকাশের অবিচ্ছেদ্য মাধ্যম।'
                : 'We believe modern clothing and tech should be sensible, comfortable, and intelligent—balancing authentic culture with forward-looking design.'}
            </p>
          </div>

          {/* 3 Pillars */}
          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5">
              <div className="flex items-center gap-2 text-teal-800 font-bold text-xs uppercase font-mono">
                <Shirt size={14} />
                <span>01 · Smart Couture</span>
              </div>
              <h3 className="font-bold text-stone-900 text-sm">
                {isBn ? 'স্মার্ট ফেব্রিক ও ক্যুট্যুর' : 'Smart Fabrics & Couture'}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {isBn
                  ? 'অপটিক-ফাইবার, তাপমাত্রা নিয়ন্ত্রণকারী মেমব্রেন এবং জেনারেটিভ এআই প্যাটার্ন মেকিং।'
                  : 'Optic-fiber textiles, temperature-regulating membranes, and generative 3D garment physics.'}
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5">
              <div className="flex items-center gap-2 text-teal-800 font-bold text-xs uppercase font-mono">
                <Cpu size={14} />
                <span>02 · Wearables & Techwear</span>
              </div>
              <h3 className="font-bold text-stone-900 text-sm">
                {isBn ? 'ওয়্যারেবলস ও টেকওয়্যার' : 'Wearables & Techwear'}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {isBn
                  ? 'টাইটানিয়াম স্মার্টওয়াচ, অদৃশ্য বায়োমেট্রিক রিং এবং আর্টিকুলেটেড ওয়াটারপ্রুফ জ্যাকেট।'
                  : 'Minimalist titanium smartwatches, screen-free biometric rings, and Fidlock-equipped outerwear.'}
              </p>
            </div>
          </div>

          {/* Fictitious Editorial Team (No real user name) */}
          <div className="p-5 bg-stone-50 rounded-xl border border-stone-200/80 space-y-3">
            <h3 className="font-serif font-bold text-stone-900 text-sm">
              {isBn ? 'সম্পাদকীয় দল ও ফ্যাশন-টেক কিউরেটরস' : 'Editorial Leadership'}
            </h3>
            <ul className="text-xs text-stone-700 space-y-2">
              <li className="flex items-start gap-2">
                <Check size={14} className="text-teal-700 shrink-0 mt-0.5" />
                <span>
                  <strong>{isBn ? FICTITIOUS_EDITORIAL_TEAM.editorInChief.name_bn : FICTITIOUS_EDITORIAL_TEAM.editorInChief.name_en}</strong> — {isBn ? FICTITIOUS_EDITORIAL_TEAM.editorInChief.title_bn : FICTITIOUS_EDITORIAL_TEAM.editorInChief.title_en}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={14} className="text-teal-700 shrink-0 mt-0.5" />
                <span>
                  <strong>{isBn ? FICTITIOUS_EDITORIAL_TEAM.techwearLead.name_bn : FICTITIOUS_EDITORIAL_TEAM.techwearLead.name_en}</strong> — {isBn ? FICTITIOUS_EDITORIAL_TEAM.techwearLead.title_bn : FICTITIOUS_EDITORIAL_TEAM.techwearLead.title_en}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={14} className="text-teal-700 shrink-0 mt-0.5" />
                <span>
                  <strong>{isBn ? FICTITIOUS_EDITORIAL_TEAM.wearablesEditor.name_bn : FICTITIOUS_EDITORIAL_TEAM.wearablesEditor.name_en}</strong> — {isBn ? FICTITIOUS_EDITORIAL_TEAM.wearablesEditor.title_bn : FICTITIOUS_EDITORIAL_TEAM.wearablesEditor.title_en}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={14} className="text-teal-700 shrink-0 mt-0.5" />
                <span>
                  <strong>{isBn ? FICTITIOUS_EDITORIAL_TEAM.digitalCouture.name_bn : FICTITIOUS_EDITORIAL_TEAM.digitalCouture.name_en}</strong> — {isBn ? FICTITIOUS_EDITORIAL_TEAM.digitalCouture.title_bn : FICTITIOUS_EDITORIAL_TEAM.digitalCouture.title_en}
                </span>
              </li>
            </ul>
          </div>

          <div className="pt-2 flex justify-between items-center text-xs text-stone-500 border-t border-stone-100">
            <span>{isBn ? 'ডিজাইন ও ইনোভেশন স্টুডিও' : 'Design & Innovation Studio'}</span>
            <Link
              href={`/${lang}/contact`}
              className="text-teal-800 hover:text-teal-900 font-semibold underline-offset-4 hover:underline"
            >
              {isBn ? 'যোগাযোগ করুন →' : 'Contact Ateliers →'}
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}