import { prisma } from './prisma'

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

export class AuditService {
  static async log(data: AuditLogData): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userEmail: data.userEmail,
          databaseId: data.databaseId,
          databaseName: data.databaseName,
          tableName: data.tableName,
          rowId: data.rowId,
          action: data.action,
          beforeData: data.beforeData || null,
          afterData: data.afterData || null,
          ipAddress: data.ipAddress,
        }
      })
    } catch (error) {
      console.error('Failed to create audit log:', error)
      // Don't throw - audit logging should not break the main operation
    }
  }

  static async getAuditLogs(limit = 100, offset = 0) {
    return prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: { email: true }
        },
        database: {
          select: { name: true }
        }
      }
    })
  }

  static async getAuditLogsForDatabase(databaseId: string, limit = 100) {
    return prisma.auditLog.findMany({
      where: { databaseId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        user: {
          select: { email: true }
        }
      }
    })
  }
}