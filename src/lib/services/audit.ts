import { db } from '@/db';
import { auditLogs } from '@/db/schema';
import crypto from 'crypto';

interface AuditLogPayload {
  userId: string;
  action: string; // e.g. "SKKB_CREATE", "USER_LOGIN"
  details: unknown;   // Object or string, will be stored as JSON string
  periodId: string;
  pondokId: string;
}

/**
 * Helper global untuk mencatat seluruh mutasi data penting dan aktivitas sistem ke audit log database
 */
export async function writeAuditLog({
  userId,
  action,
  details,
  periodId,
  pondokId,
}: AuditLogPayload): Promise<string> {
  const id = `audit-${crypto.randomBytes(8).toString('hex')}`;
  const timestamp = new Date().toISOString();
  const detailsStr = typeof details === 'string' ? details : JSON.stringify(details);

  await db.insert(auditLogs).values({
    id,
    userId,
    action,
    details: detailsStr,
    timestamp,
    periodId,
    pondokId,
  });

  return id;
}
