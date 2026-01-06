import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { JWTService } from './lib/jwt'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/api/auth/login', '/api/auth/verify-otp']
  
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Check for JWT token
  const user = JWTService.extractFromRequest(request)
  
  if (!user) {
    // Redirect to login if no valid token
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // CRITICAL: For database write operations, check OTP verification
  if (pathname.includes('/api/databases/update-row') || pathname.includes('/api/database/write')) {
    if (!user.otpVerified) {
      return NextResponse.json(
        { error: 'OTP verification required for database writes' },
        { status: 403 }
      )
    }
  }

  // Add user info to headers for API routes
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', user.userId)
  requestHeaders.set('x-user-email', user.email)
  requestHeaders.set('x-user-role', user.role)
  requestHeaders.set('x-otp-verified', user.otpVerified.toString())

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}

