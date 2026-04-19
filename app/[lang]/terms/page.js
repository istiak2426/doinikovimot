export const metadata = {
  title: "শর্তাবলী - Doinik Obhimot",
  description: "ওয়েবসাইট ব্যবহারের শর্তাবলী",
}

export default function Terms() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">শর্তাবলী</h1>

      <p className="mb-4">
        এই ওয়েবসাইট ব্যবহার করার মাধ্যমে আপনি নিম্নলিখিত শর্তাবলীতে সম্মত হচ্ছেন।
      </p>

      <h2 className="font-semibold mt-4">কনটেন্ট ব্যবহার</h2>
      <p className="mb-4">
        আমাদের কনটেন্ট অনুমতি ছাড়া কপি বা পুনঃপ্রকাশ করা যাবে না।
      </p>

      <h2 className="font-semibold mt-4">দায়বদ্ধতা</h2>
      <p className="mb-4">
        এই ওয়েবসাইটের তথ্য শুধুমাত্র তথ্যগত উদ্দেশ্যে প্রদান করা হয়েছে।
      </p>

      <h2 className="font-semibold mt-4">পরিবর্তন</h2>
      <p>
        আমরা যেকোনো সময় এই শর্তাবলী পরিবর্তন করার অধিকার রাখি।
      </p>
    </div>
  )
}