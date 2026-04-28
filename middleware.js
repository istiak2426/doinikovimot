import { NextResponse } from 'next/server'

const locales = ['bn', 'en']
const defaultLocale = 'bn'

export function middleware(request) {
  const { pathname } = request.nextUrl

  // 🔥 Get user agent
  const ua = request.headers.get('user-agent') || ''

  // 🔥 Detect crawlers (Facebook, Twitter, etc.)
  const isBot =
    ua.includes('facebookexternalhit') ||
    ua.includes('Facebot') ||
    ua.includes('Twitterbot') ||
    ua.includes('Slackbot') ||
    ua.includes('LinkedInBot') ||
    ua.includes('WhatsApp')

  // ✅ 1. ALWAYS allow bots (CRITICAL FIX)
  if (isBot) {
    return NextResponse.next()
  }

  // ✅ 2. Always allow article pages (no redirect, no block)
  if (pathname.includes('/article/')) {
    return NextResponse.next()
  }

  // ✅ 3. Skip static files and Next internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // files like .png, .jpg, etc.
  ) {
    return NextResponse.next()
  }

  // ✅ 4. Check if locale exists
  const hasLocale = locales.some(
    (locale) =>
      pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (hasLocale) {
    return NextResponse.next()
  }

  // ✅ 5. Redirect to default locale
  const url = request.nextUrl.clone()
  url.pathname = `/${defaultLocale}${pathname}`

  return NextResponse.redirect(url)
}

// 🔥 Matcher (keep clean)
export const config = {
  matcher: [
    '/((?!_next|api|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}
