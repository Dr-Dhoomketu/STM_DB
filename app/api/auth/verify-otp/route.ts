import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OTPService } from '@/lib/otp'
import { JWTService } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      )
    }

    // 🔍 Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // 🔐 Verify OTP
    const isValid = await OTPService.verifyStoredOTP(user.id, otp)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 401 }
      )
    }

    // ✅ CREATE AUTH TOKEN (otpVerified = true)
    const token = JWTService.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
      otpVerified: true
    })

    // ✅ SET COOKIE
    const response = NextResponse.json({ success: true })
    response.headers.set(
      'Set-Cookie',
      JWTService.createCookie(token)
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
