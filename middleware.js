import { NextResponse } from 'next/server'

const locales = ['bn', 'en']
const defaultLocale = 'bn'

export function middleware(request) {
  const pathname = request.nextUrl.pathname
  
  // Allow public access to article routes (no redirect needed)
  // This ensures Facebook crawler can access articles directly
  if (pathname.includes('/article/')) {
    return NextResponse.next()
  }
  
  // Check if pathname has locale
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  
  if (pathnameHasLocale) return NextResponse.next()
  
  // Redirect to default locale for other routes
  request.nextUrl.pathname = `/${defaultLocale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)',
  ],
}