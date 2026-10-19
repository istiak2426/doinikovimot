export default function About({ params }) {
  const isBn = !params || params.lang === 'bn'

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-red-600 pb-4 mb-6">
          <h1 className="text-3xl font-extrabold text-red-600 font-bangla">
            {isBn ? 'আঁতেল (Aatel) সম্পর্কে' : 'About Aatel'}
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">
            {isBn
              ? 'নিজেদের বুদ্ধিজীবী ভাবা লোকদের নিয়ে মজার খোঁচা'
              : 'Poking fun at self-proclaimed intellectuals'}
          </p>
        </div>

        <div className="space-y-4 text-gray-700 leading-relaxed font-bangla text-base">
          <p>
            <strong>আঁতেল (Aatel)</strong> একটি নিখাদ স্যাটায়ার, রম্য ও তরুণ সংস্কৃতির ডিজিটাল পোর্টাল। 
            সোশ্যাল মিডিয়া ও বাস্তব জীবনে যারা নিজেদের মাত্রাতিরিক্ত জ্ঞানী, বুদ্ধিজীবী কিংবা সবজান্তা মনে করে জ্ঞান বিতরণ করতে ভালোবাসেন—তাদের চিন্তাভাবনা ও ভণ্ডামিকে এক চিমটি রম্যরস দিয়ে সহজ ভাষায় তুলে ধরাই আমাদের প্রধান কাজ।
          </p>

          <p>
            আমাদের উদ্দেশ্য কাউকে ব্যক্তিগতভাবে আঘাত করা নয়; বরং চারপাশের সামাজিক, সাংস্কৃতিক ও ট্রেন্ডিং অসংগতিগুলোকে মজার ছলে উপস্থাপন করে সবাইকে একটু হাসানো এবং ভাবানো।
          </p>

          <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-600 my-6">
            <h3 className="font-bold text-red-800 text-sm mb-1">
              ⚠️ বিশেষ সতর্কবার্তা (Satire Disclaimer)
            </h3>
            <p className="text-xs text-red-700">
              আঁতেল-এ প্রকাশিত অধিকাংশ খবর ও মন্তব্য খাঁটি স্যাটায়ার এবং কাল্পনিক। বাস্তব কোনো জীবিত বা মৃত আঁতেলের সাথে মিলে গেলে তা সম্পূর্ণ কাকতালীয় এবং আপনার মাত্রাতিরিক্ত গম্ভীরতার লক্ষণ!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}