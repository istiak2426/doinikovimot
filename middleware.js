import { NextResponse } from 'next/server'

const locales = ['bn', 'en']
const defaultLocale = 'bn'

export function middleware(request) {
  const pathname = request.nextUrl.pathname
  
  // Check if pathname has locale
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  
  if (pathnameHasLocale) return
  
  // Redirect to default locale
  request.nextUrl.pathname = `/${defaultLocale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)',
  ],
}