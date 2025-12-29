import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n/request'

// Create i18n middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
})

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  
  // Skip i18n for API routes and static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/goodwin') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next()
  }

  // Apply i18n middleware first
  const intlResponse = intlMiddleware(req)
  
  // Extract locale from the URL
  const pathnameLocale = locales.find(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  const locale = pathnameLocale || defaultLocale

  // Create response with i18n headers
  let response = intlResponse || NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  // Setup Supabase client for auth check
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Check auth status
  const { data: { session } } = await supabase.auth.getSession()

  // Protected routes (require authentication)
  // These are paths WITHOUT the locale prefix
  const protectedPaths = ['/scenario/', '/dm/']
  const isProtectedRoute = protectedPaths.some(path => 
    pathname.startsWith(`/${locale}${path}`) || pathname.startsWith(path)
  )

  // Auth routes (redirect if already logged in)
  const authPaths = ['/login', '/register']
  const isAuthRoute = authPaths.some(path => 
    pathname.startsWith(`/${locale}${path}`) || pathname.startsWith(path)
  )

  // Redirect to home with auth modal if accessing protected route without session
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL(`/${locale}`, req.url)
    redirectUrl.searchParams.set('auth', 'register')
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect to home if accessing auth route with active session
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL(`/${locale}`, req.url))
  }

  return response
}

export const config = {
  matcher: [
    // Match all pathnames except api, _next, and static files
    '/((?!api|_next|goodwin|.*\\..*).*)',
  ],
}
