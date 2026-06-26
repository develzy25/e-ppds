import { db } from '@/db';
import { systemAuditLogs } from '@/db/audit.schema';
import { generateId } from '../utils';

export interface AuditLogPayload {
  module: string;
  entity: string;
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'LOGIN' | 'LOGOUT' | 'APPROVE' | 'REJECT' | 'EXPORT' | 'IMPORT';
  beforeData?: unknown;
  afterData?: unknown;
  performedBy: string;
  ipAddress?: string;
  userAgent?: string;
  remarks?: string;
}

export abstract class BaseService {
  async logAudit(params: {
    module: string;
    entity: string;
    entityId: string;
    action: string;
    beforeData?: unknown;
    afterData?: unknown;
    performedBy: string;
    remarks?: string;
  }) {
    await db.insert(systemAuditLogs).values({
      id: generateId('adt'),
      module: params.module,
      entity: params.entity,
      entityId: params.entityId,
      action: params.action,
      beforeData: params.beforeData ? JSON.stringify(params.beforeData) : null,
      afterData: params.afterData ? JSON.stringify(params.afterData) : null,
      performedBy: params.performedBy,
      performedAt: new Date().toISOString(),
      remarks: params.remarks,
    });
  }

  requirePermission(userPermissions: string[], requiredPermission: string) {
    if (!userPermissions.includes(requiredPermission) && !userPermissions.includes('SUPER_ADMIN')) {
      throw new Error(`Akses ditolak. Membutuhkan permission: ${requiredPermission}`);
    }
  }
}
