import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'
import { prisma } from './prisma'

export class OTPService {
  private static transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASSWORD,
    },
  })

  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  static async hashOTP(otp: string): Promise<string> {
    return bcrypt.hash(otp, 12)
  }

  static async verifyOTP(otp: string, hash: string): Promise<boolean> {
    return bcrypt.compare(otp, hash)
  }

  static async storeOTP(userId: string, otp: string): Promise<void> {
    const otpHash = await this.hashOTP(otp)
    const expiresAt = new Date(
      Date.now() +
        Number(process.env.OTP_EXPIRY_MINUTES || 5) * 60 * 1000
    )

    await prisma.loginOtp.deleteMany({
      where: { userId },
    })

    await prisma.loginOtp.create({
      data: {
        userId,
        otpHash,
        expiresAt,
      },
    })
  }

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

  static async verifyStoredOTP(userId: string, otp: string): Promise<boolean> {
    const storedOtp = await prisma.loginOtp.findFirst({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
    })

    if (!storedOtp) return false

    const valid = await this.verifyOTP(otp, storedOtp.otpHash)

    if (valid) {
      await prisma.loginOtp.delete({
        where: { id: storedOtp.id },
      })
    }

    return valid
  }
}
