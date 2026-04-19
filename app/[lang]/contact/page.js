export const metadata = {
  title: "যোগাযোগ - Doinik Obhimot",
  description: "আমাদের সাথে যোগাযোগ করুন - যেকোনো প্রশ্ন, মতামত বা সহযোগিতার জন্য",
}

export default function Contact() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">যোগাযোগ</h1>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
        <p className="text-gray-700">
          যেকোনো প্রশ্ন, মতামত বা সহযোগিতার জন্য আমাদের সাথে যোগাযোগ করুন। আপনার বার্তা পেয়ে আমরা দ্রুত সাড়া দিতে চেষ্টা করব।
        </p>
      </div>

      <div className="bg-gray-50 p-5 rounded-lg mb-6 space-y-3">
        <p className="flex items-center gap-3">
          <span className="font-semibold text-gray-700 min-w-[70px]">ইমেইল:</span>
          <a href="mailto:doinikovimot@gmail.com" className="text-blue-600 hover:underline">doinikovimot@gmail.com</a>
        </p>
        <p className="flex items-center gap-3">
          <span className="font-semibold text-gray-700 min-w-[70px]">ফোন:</span>
          <a href="tel:+880168352291" className="text-blue-600 hover:underline">+880168352291</a>
        </p>
        <p className="flex items-center gap-3">
          <span className="font-semibold text-gray-700 min-w-[70px]">ঠিকানা:</span>
          <span>ঢাকা, বাংলাদেশ</span>
        </p>
      </div>

      <form
        action="https://formsubmit.co/doinikovimot@gmail.com"
        method="POST"
        className="space-y-4 bg-white p-6 rounded-lg shadow-md border"
      >
        {/* FormSubmit configuration */}
        <input type="hidden" name="_subject" value="Doinik Obhimot - নতুন যোগাযোগ বার্তা" />
        <input type="hidden" name="_captcha" value="true" />
        <input type="hidden" name="_template" value="table" />
        <input type="hidden" name="_replyto" value="email" />
        
        {/* Honeypot spam protection */}
        <div className="hidden">
          <label htmlFor="_gotcha">Don't fill this</label>
          <input type="text" id="_gotcha" name="_gotcha" tabIndex={-1} autoComplete="off" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">আপনার নাম *</label>
          <input
            type="text"
            name="name"
            placeholder="পূর্ণ নাম"
            required
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">আপনার ইমেইল *</label>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            required
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">আপনার বার্তা *</label>
          <textarea
            name="message"
            placeholder="আপনার মতামত, প্রশ্ন বা প্রয়োজনীয় বিবরণ লিখুন..."
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
            rows="5"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition duration-200 shadow-sm hover:shadow-md"
        >
          বার্তা পাঠান
        </button>

        <p className="text-xs text-gray-400 text-center mt-3">
          <span className="inline-flex items-center gap-1">🔒</span> আপনার তথ্য নিরাপদে সংরক্ষিত হবে
        </p>
      </form>

      {/* Success message handler (for redirect fallback) */}
      {typeof window !== 'undefined' && window.location.search.includes('success=true') && (
        <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
          আপনার বার্তা সফলভাবে পাঠানো হয়েছে! আমরা শীঘ্রই যোগাযোগ করব।
        </div>
      )}
    </div>
  )
}