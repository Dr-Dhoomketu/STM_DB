import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  // Clear auth cookie (EDGE SAFE)
  cookies().set({
    name: 'auth-token',
    value: '',
    httpOnly: true,
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
    secure: false,
  })

  return NextResponse.json({ success: true })
}
