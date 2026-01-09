import { SignJWT, jwtVerify } from 'jose'
import { NextRequest } from 'next/server'

export interface JWTPayload {
  userId: string
  email: string
  role: string
  otpVerified: boolean
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export class JWTServiceEdge {
  static async sign(payload: JWTPayload): Promise<string> {
    return await new SignJWT(payload as any)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret)
  }

  static async verify(token: string): Promise<JWTPayload | null> {
    try {
      const { payload } = await jwtVerify(token, secret)
      return payload as JWTPayload
    } catch {
      return null
    }
  }

  static async extractFromRequest(request: NextRequest): Promise<JWTPayload | null> {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return null
    return this.verify(token)
  }

  static createCookie(token: string): string {
    const isProduction = process.env.NODE_ENV === 'production'
    return `auth-token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict${isProduction ? '; Secure' : ''}`
  }

  static clearCookie(): string {
    return 'auth-token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict'
  }
}
