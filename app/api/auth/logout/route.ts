import { NextResponse } from 'next/server'
import { JWTService } from '@/lib/jwt'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.headers.set('Set-Cookie', JWTService.clearCookie())
  return response
}