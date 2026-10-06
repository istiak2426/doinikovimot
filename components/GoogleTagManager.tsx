// components/GoogleTagManager.tsx
import Script from 'next/script';

export default function GoogleTagManager() {
  const GTM_ID = 'GTM-KNWCB9D9'; // আপনার স্ক্রিনশট থেকে পাওয়া ID

  return (
    <>
      {/* ১. Head-এর জন্য GTM স্ক্রিপ্ট */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `,
        }}
      />
      
      {/* ২. Body-এর শুরুতে বসানোর জন্য Noscript কোড */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  );
}
