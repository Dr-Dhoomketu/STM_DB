import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { JWTService } from '@/lib/jwt'
import { AuditService } from '@/lib/audit'

export async function POST(request: NextRequest) {
  try {
    // Extract and verify JWT
    const user = JWTService.extractFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // CRITICAL: Check OTP verification state
    if (!user.otpVerified) {
      return NextResponse.json(
        { error: 'OTP verification required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { tableName, rowId, beforeData, afterData, confirm } = body

    // MANDATORY: Server-side YES confirmation check
    if (confirm !== 'YES') {
      return NextResponse.json(
        { error: 'Confirmation required. Must type "YES" exactly.' },
        { status: 400 }
      )
    }

    if (!tableName || !rowId || !beforeData || !afterData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get client IP for audit
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'

    // Execute write + audit in transaction (CRITICAL)
    await prisma.$transaction(async (tx) => {
      // Perform the database write
      // Note: This is a generic example - you'll need to adapt based on your table structure
      const updateData = { ...afterData }
      delete updateData.id // Remove ID from update data
      
      await tx.$executeRawUnsafe(
        `UPDATE "${tableName}" SET ${Object.keys(updateData).map(key => `"${key}" = $${Object.keys(updateData).indexOf(key) + 2}`).join(', ')} WHERE id = $1`,
        rowId,
        ...Object.values(updateData)
      )

      // Create audit log (MANDATORY)
      await tx.auditLog.create({
        data: {
          userId: user.userId,
          userEmail: user.email,
          tableName,
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