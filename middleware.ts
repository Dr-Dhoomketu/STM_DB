import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { JWTService } from './lib/jwt'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 🔍 TEMP DEBUG (REMOVE LATER)
  console.log('MIDDLEWARE COOKIES:', request.cookies.getAll())

  // Public routes
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next()
  }

  const user = JWTService.extractFromRequest(request)

  console.log('MIDDLEWARE USER:', user)

  if (!user) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // OTP protection for DB writes
  if (
    pathname.includes('/api/databases/update-row') ||
    pathname.includes('/api/database/write')
  ) {
    if (!user.otpVerified) {
      return NextResponse.json(
        { error: 'OTP verification required for database writes' },
        { status: 403 }
      )
    }
  }

  const headers = new Headers(request.headers)
  headers.set('x-user-id', user.userId)
  headers.set('x-user-email', user.email)
  headers.set('x-user-role', user.role)
  headers.set('x-otp-verified', String(user.otpVerified))

  return NextResponse.next({
    request: { headers },
  })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
