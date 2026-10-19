export default function About({ params }) {
  const isBn = !params || params.lang === 'bn'

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-200">
        <div className="border-b border-stone-200 pb-5 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-red-600 text-white font-black text-xl px-2.5 py-0.5 rounded font-bangla">
              {isBn ? 'ওরে নেতা রে' : 'ORE NETA RE'}
            </span>
            <span className="text-xs font-mono font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded uppercase">
              SATIRE & MEME
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-stone-900 font-bangla">
            {isBn ? 'ওরে নেতা রে (Ore Neta Re) সম্পর্কে' : 'About Ore Neta Re'}
          </h1>
          <p className="text-stone-500 text-sm mt-1 font-medium">
            {isBn
              ? 'রাজনীতি, নেতাদের কাণ্ডকারখানা, ভাইরাল মিমস ও সমকালীন পপ-কালচার রোস্ট'
              : 'Satire, political comedy, viral memes, and leader roasts in contemporary culture'}
          </p>
        </div>

        <div className="space-y-5 text-stone-700 leading-relaxed font-bangla text-base">
          <p>
            <strong>ওরে নেতা রে (Ore Neta Re)</strong> হলো সমকালীন রাজনীতি, নেতাদের মজার কাণ্ডকারখানা, ভাইরাল মিমস ও তরুণ সংস্কৃতির জমজমাট স্যাটায়ার এবং রোস্টিং প্ল্যাটফর্ম।
          </p>

          <p>
            আমাদের উদ্দেশ্য কাউকে ব্যক্তিগত আক্রমণ করা নয়; বরং চারপাশের সামাজিক, রাজনৈতিক ও ট্রেন্ডিং অসংগতিগুলোকে বুদ্ধিদীপ্ত রসবোধ, মিমস ও এক্সপ্লেইনারের মাধ্যমে উন্মুক্ত করে সবার মুখে একটু হাসি আর চিন্তার খোরাক জোগানো।
          </p>

          <div className="grid sm:grid-cols-2 gap-4 my-6">
            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
              <span className="text-xs font-mono font-bold text-red-700 uppercase">01 · SATIRE & ROAST</span>
              <h3 className="font-bold text-stone-900 text-base mt-1 mb-1">
                {isBn ? 'নেতাদের কাণ্ড ও রোস্ট' : 'Political Satire & Roasts'}
              </h3>
              <p className="text-xs text-stone-600">
                {isBn
                  ? 'জননেতাদের বাহারি বক্তৃতা, অদ্ভুত প্রতিশ্রুতি ও প্রতিদিনের ভাইরাল মুহূর্তের নির্ভেজাল রসবোধ।'
                  : 'Witty commentary on speeches, wild promises, and unforgettable political antics.'}
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
              <span className="text-xs font-mono font-bold text-stone-700 uppercase">02 · VIRAL MEMES</span>
              <h3 className="font-bold text-stone-900 text-base mt-1 mb-1">
                {isBn ? 'ইন্টারনেট মিমস ও ফ্যাশন' : 'Internet Memes & Style'}
              </h3>
              <p className="text-xs text-stone-600">
                {isBn
                  ? 'সোশ্যাল মিডিয়ায় কী ট্রেন্ডিং, নতুন কোন মিম ভাইরাল হলো এবং তরুণদের ফ্যাশন স্টেটমেন্ট।'
                  : 'Decoding viral internet sensations, trending templates, and youth subcultures.'}
              </p>
            </div>
          </div>

          <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-600 my-6">
            <h3 className="font-bold text-red-900 text-sm mb-1">
              {isBn ? '⚠️ স্যাটায়ার সতর্কবার্তা (Satire Disclaimer)' : '⚠️ Satire Disclaimer'}
            </h3>
            <p className="text-xs text-red-800 leading-relaxed">
              {isBn
                ? 'ওরে নেতা রে-তে প্রকাশিত ব্যঙ্গাত্মক কনটেন্ট খাঁটি স্যাটায়ার ও বিনোদনের উদ্দেশ্যে তৈরি। বাস্তব কোনো জীবিত বা সাবেক নেতার সাথে হুবহু মিল খুঁজে পেলে তা নিতান্তই কাকতালীয়!'
                : 'Content published on Ore Neta Re contains parody, satire, and humor intended for entertainment and free expression.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}