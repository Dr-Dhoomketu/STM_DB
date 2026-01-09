import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

export interface JWTPayload {
  userId: string
  email: string
  role: string
  otpVerified: boolean
}

export class JWTService {
  private static secret = process.env.JWT_SECRET!

  static sign(payload: JWTPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: '24h' })
  }

  static verify(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, this.secret) as JWTPayload
    } catch {
      return null
    }
  }

  // ✅ EDGE-SAFE COOKIE READ
  static extractFromRequest(request: NextRequest): JWTPayload | null {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return null
    return this.verify(token)
  }
  // ✅ Add this method for cookie creation
  static createCookie(token: string): string {
    const maxAge = 60 * 60 * 24 // 24 hours
    const isProduction = process.env.NODE_ENV === 'production'
    return `auth-token=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax${
      isProduction ? '; Secure' : ''
    }`
  }
}
