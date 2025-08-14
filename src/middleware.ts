import { getSessionCookie } from 'better-auth/cookies'
import { type NextRequest, NextResponse } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)

  // THIS IS NOT SECURE!
  // This is the recommended approach to optimistically redirect users
  // We recommend handling auth checks in each page/route
  if (!sessionCookie) {
    console.log(request.nextUrl.pathname)
    const isPublicRoute =
      request.nextUrl.pathname === '/' || //
      request.nextUrl.pathname.startsWith('/sign-in') ||
      request.nextUrl.pathname.startsWith('/articles/') ||
      request.nextUrl.pathname.startsWith('/test')

    if (isPublicRoute) {
      // If the user is already on the sign-in page, allow them to stay there
      return NextResponse.next()
    }

    console.log('redirect to sign-in by middleware')
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|twitter-image.jpg|opengraph-image.jpg|logo.jpeg).*)',
  ],
}
