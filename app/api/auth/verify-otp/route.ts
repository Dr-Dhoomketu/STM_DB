import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OTPService } from '@/lib/otp'
import { JWTServiceEdge } from '@/lib/jwt-edge'

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const isValidOTP = await OTPService.verifyStoredOTP(user.id, otp)

    if (!isValidOTP) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 401 }
      )
    }

    // ✅ CREATE JWT WITH OTP VERIFIED (using Edge-compatible version)
    const token = await JWTServiceEdge.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
      otpVerified: true
    })

    const response = NextResponse.json({ success: true })
    
    // ✅ SET AUTH COOKIE
    response.headers.set(
      'Set-Cookie',
      JWTServiceEdge.createCookie(token)
    )

    return response
  } catch (error) {
    console.error('OTP verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
