import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { JWTService } from './jwt'

/**
 * Updates the session to mark OTP as verified
 * Called after successful OTP verification
 */
export async function setOTPVerified(
  request: NextRequest,
  userId: string,
  email: string,
  role: string
): Promise<NextResponse> {

  // Create new JWT with OTP verified
  const token = JWTService.sign({
    userId,
    email,
    role,
    otpVerified: true,
  })

  // ✅ EDGE + COOLIFY SAFE COOKIE SET
  cookies().set({
    name: 'auth-token',
    value: token,
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
    sameSite: 'lax',
    secure: false, // IMPORTANT for Coolify reverse proxy
  })

  return NextResponse.json({
    success: true,
    user: { id: userId, email, role },
  })
}

/**
 * Checks if the current session has OTP verification
 * Used by database write APIs to enforce OTP requirement
 */
export function requireOTPVerification(
  request: NextRequest
): { verified: boolean; user?: any; error?: string } {

  const user = JWTService.extractFromRequest(request)

  if (!user) {
    return { verified: false, error: 'No valid session found' }
  }

  if (!user.otpVerified) {
    return { verified: false, error: 'OTP verification required to modify database' }
  }

  return { verified: true, user }
}
