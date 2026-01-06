import { prisma } from './prisma'
import { headers } from 'next/headers'

/**
 * Audit log input structure
 * MUST match Prisma schema
 */
export interface AuditLogData {
  userEmail: string
  databaseId?: string
  databaseName: string
  tableName: string
  rowId?: string
  action: 'VIEW' | 'INSERT' | 'UPDATE' | 'DELETE'
  beforeData?: any
  afterData?: any
  ipAddress?: string
}

/**
 * Centralized audit logging service
 * Never throws errors (audit must not break app)
 */
export class AuditService {
  static async log(data: AuditLogData): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userEmail: data.userEmail,
          databaseId: data.databaseId ?? null,
          databaseName: data.databaseName,
          tableName: data.tableName,
          rowId: data.rowId ?? null,
          action: data.action,
          beforeData: data.beforeData ?? null,
          afterData: data.afterData ?? null,
          ipAddress: data.ipAddress ?? null,
        },
      })
    } catch (error) {
      console.error('Failed to create audit log:', error)
      // IMPORTANT: do not throw
    }
  }

  static async getAuditLogs(limit = 100, offset = 0) {
    return prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
      include: {
        user: { select: { email: true } },
        database: { select: { name: true } },
      },
    })
  }

  static async getAuditLogsForDatabase(databaseId: string, limit = 100) {
    return prisma.auditLog.findMany({
      where: { databaseId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        user: { select: { email: true } },
      },
    })
  }
}

/**
 * ✅ COMPATIBILITY EXPORT
 * This is what your routes are importing
 */
export async function logAuditEvent(data: AuditLogData): Promise<void> {
  return AuditService.log(data)
}

/**
 * Extract client IP (works behind Coolify / proxy)
 */
export function getClientIp(): string {
  const forwardedFor = headers().get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  return 'unknown'
}
