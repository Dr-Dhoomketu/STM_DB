import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { JWTService } from '@/lib/jwt'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // 🔐 Extract and verify JWT
    const user = JWTService.extractFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 🔐 OTP must be verified
    if (!user.otpVerified) {
      return NextResponse.json(
        { error: 'OTP verification required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      databaseName,
      tableName,
      rowId,
      beforeData,
      afterData,
      confirm
    } = body

    // ✅ Mandatory YES confirmation
    if (confirm !== 'YES') {
      return NextResponse.json(
        { error: 'Confirmation required. Must type "YES" exactly.' },
        { status: 400 }
      )
    }

    // ✅ Validation
    if (
      !databaseName ||
      !tableName ||
      !rowId ||
      !beforeData ||
      !afterData
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 🌐 Client IP (for audit)
    const clientIP =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // 🔥 TRANSACTION: write + audit (MANDATORY)
    await prisma.$transaction(async (tx) => {
      const updateData = { ...afterData }
      delete updateData.id

      const keys = Object.keys(updateData)
      const values = Object.values(updateData)

      if (keys.length === 0) {
        throw new Error('No fields to update')
      }

      const setClause = keys
        .map((key, index) => `"${key}" = $${index + 2}`)
        .join(', ')

      await tx.$executeRawUnsafe(
        `UPDATE "${tableName}" SET ${setClause} WHERE id = $1`,
        rowId,
        ...values
      )

      // 🧾 AUDIT LOG (ALL REQUIRED FIELDS ✔)
      await tx.auditLog.create({
        data: {
          userId: user.userId,
          userEmail: user.email,
          databaseName: databaseName, // ✅ FIXED
          tableName: tableName,
          rowId: String(rowId),
          action: 'UPDATE',
          beforeData: beforeData,
          afterData: afterData,
          ipAddress: clientIP
        }
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Database updated successfully'
    })
  } catch (error) {
    console.error('Database write error:', error)
    return NextResponse.json(
      { error: 'Database write failed' },
      { status: 500 }
    )
  }
}
