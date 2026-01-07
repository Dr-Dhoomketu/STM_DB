import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'
import { prisma } from './prisma'

export class OTPService {
  // 📧 Mail transporter
  private static transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASSWORD,
    },
  })

  // 🔢 Generate 6-digit OTP
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // 🔐 Hash OTP before storing
  static async hashOTP(otp: string): Promise<string> {
    return bcrypt.hash(otp, 12)
  }

  // 🔍 Verify OTP against hash
  static async verifyOTP(otp: string, hash: string): Promise<boolean> {
    return bcrypt.compare(otp, hash)
  }

  // 💾 Store OTP (hashed) in DB
  static async storeOTP(userId: string, otp: string): Promise<void> {
    const otpHash = await this.hashOTP(otp)

    const expiresAt = new Date(
      Date.now() +
        Number(process.env.OTP_EXPIRY_MINUTES || 5) * 60 * 1000
    )

    // Remove old OTPs for this user
    await prisma.loginOtp.deleteMany({
      where: { userId },
    })

    // Create new OTP
    await prisma.loginOtp.create({
      data: {
        userId,
        otpHash,
        expiresAt,
      },
    })
  }

  // ✉️ Send OTP email
  static async sendOTP(email: string, otp: string): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Database Editor - Login Verification Code',
      text: `Your verification code is: ${otp}

This code will expire in ${process.env.OTP_EXPIRY_MINUTES || 5} minutes.

If you didn’t request this code, ignore this email.`,
    })
  }

  // ✅ Verify OTP stored in DB (one-time use)
  static async verifyStoredOTP(
    userId: string,
    otp: string
  ): Promise<boolean> {
    const storedOtp = await prisma.loginOtp.findFirst({
      where: {
        userId,
        expiresAt: {
          gt: new Date(),
        },
      },
    })

    if (!storedOtp) {
      return false
    }

    const isValid = await this.verifyOTP(otp, storedOtp.otpHash)

    if (isValid) {
      // One-time use → delete after success
      await prisma.loginOtp.delete({
        where: { id: storedOtp.id },
      })
    }

    return isValid
  }

  // 🧹 CLEANUP (THIS FIXES YOUR BUILD ERROR)
  static async cleanupExpiredOTPs(): Promise<void> {
    await prisma.loginOtp.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    })
  }
}
