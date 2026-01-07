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
}
