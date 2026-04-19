export const metadata = {
  title: "গোপনীয়তা নীতি - Doinik Obhimot",
  description: "আমাদের গোপনীয়তা নীতি সম্পর্কে জানুন",
}

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">গোপনীয়তা নীতি</h1>

      <p className="mb-4">
        আমরা ব্যবহারকারীদের গোপনীয়তা রক্ষা করতে প্রতিশ্রুতিবদ্ধ।
      </p>

      <h2 className="font-semibold mt-4">কুকিজ</h2>
      <p className="mb-4">
        আমাদের ওয়েবসাইট ব্যবহারকারীর অভিজ্ঞতা উন্নত করতে কুকিজ ব্যবহার করতে পারে।
      </p>

      <h2 className="font-semibold mt-4">Google AdSense</h2>
      <p className="mb-4">
        আমরা Google AdSense ব্যবহার করি, যা ব্যবহারকারীদের আগ্রহ অনুযায়ী বিজ্ঞাপন দেখাতে কুকিজ ব্যবহার করতে পারে।
      </p>

      <p className="mb-4">
        বিস্তারিত জানতে ভিজিট করুন:
        https://policies.google.com/privacy
      </p>

      <h2 className="font-semibold mt-4">তথ্য সংগ্রহ</h2>
      <p>
        আমরা ব্যক্তিগত তথ্য সংগ্রহ করি না, তবে analytics এর মাধ্যমে কিছু non-personal তথ্য সংগ্রহ হতে পারে।
      </p>
    </div>
  )
}