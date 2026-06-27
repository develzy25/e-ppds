import { AuditLogPayload } from './audit.types';
import { AuditRepository } from './audit.repository';
import crypto from 'crypto';

export class AuditService {
  constructor(private readonly auditRepository: AuditRepository) {}

  async writeAuditLog(payload: AuditLogPayload): Promise<string> {
    const id = `audit-${crypto.randomBytes(8).toString('hex')}`;
    const timestamp = new Date().toISOString();
    const beforeDataStr = payload.beforeData ? JSON.stringify(payload.beforeData) : null;
    const afterDataStr = payload.afterData ? JSON.stringify(payload.afterData) : null;

    await this.auditRepository.insert({
      id,
      module: payload.module,
      entityName: payload.entityName,
      entityId: payload.entityId,
      action: payload.action,
      beforeData: beforeDataStr,
      afterData: afterDataStr,
      performedBy: payload.performedBy,
      remarks: payload.remarks,
      tenantId: 'default',
    });

    return id;
  }
}

// Global instance for convenience during migration
export const auditService = new AuditService(new AuditRepository());

/**
 * Backward compatibility wrapper for older modules
 */
export async function writeAuditLog(payload: AuditLogPayload): Promise<string> {
  return auditService.writeAuditLog(payload);
}
