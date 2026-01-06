import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OTPService } from '@/lib/otp'
import { setOTPVerified } from '@/lib/session-utils'

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify OTP
    const isValidOTP = await OTPService.verifyStoredOTP(user.id, otp)
    if (!isValidOTP) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 401 }
      )
    }

    // Set OTP verified in session - this is the critical security fix
    return await setOTPVerified(request, user.id, user.email, user.role)

  } catch (error) {
    console.error('OTP verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}