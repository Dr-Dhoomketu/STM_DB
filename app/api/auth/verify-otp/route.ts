import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OTPService } from '@/lib/otp'
import { JWTService } from '@/lib/jwt'
import { cookies } from 'next/headers'

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

    // ✅ Create JWT
    const token = JWTService.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
      otpVerified: true,
    })

    // ✅ SET COOKIE USING next/headers (EDGE SAFE)
    cookies().set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24, // 24h
      sameSite: 'lax',
      secure: false, // IMPORTANT: works behind Coolify proxy
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('OTP verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
