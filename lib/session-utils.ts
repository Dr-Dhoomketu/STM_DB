import { NextRequest, NextResponse } from 'next/server';
import { JWTService } from './jwt';

/**
 * Updates the session to mark OTP as verified
 * This is called after successful OTP verification
 */
export async function setOTPVerified(request: NextRequest, userId: string, email: string, role: string): Promise<NextResponse> {
  // Create new JWT with OTP verified
  const token = JWTService.sign({
    userId,
    email,
    role,
    otpVerified: true
  });

  const response = NextResponse.json({
    success: true,
    user: { id: userId, email, role }
  });

  response.headers.set('Set-Cookie', JWTService.createCookie(token));
  return response;
}

/**
 * Checks if the current session has OTP verification
 * Used by database write APIs to enforce OTP requirement
 */
export function requireOTPVerification(request: NextRequest): { verified: boolean; user?: any; error?: string } {
  const user = JWTService.extractFromRequest(request);
  
  if (!user) {
    return { verified: false, error: 'No valid session found' };
  }

  if (!user.otpVerified) {
    return { verified: false, error: 'OTP verification required to modify database' };
  }

  return { verified: true, user };
}