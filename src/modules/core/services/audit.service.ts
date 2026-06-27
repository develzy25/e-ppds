import { db } from '@/db';
import { systemAuditLogs } from '../schemas/core.schema';

type AuditLogInsert = typeof systemAuditLogs.$inferInsert;

/**
 * Menyimpan catatan audit log ke database.
 * Fungsi ini digunakan di dalam Service Layer setiap modul setelah aksi krusial selesai.
 */
export async function insertAuditLog(data: Omit<AuditLogInsert, 'id' | 'createdAt'>) {
  try {
    const id = `aud-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    await db.insert(systemAuditLogs).values({
      id,
      ...data,
    });
  } catch (error) {
    console.error('Failed to insert audit log:', error);
    // Audit log error should ideally not crash the main transaction,
    // but in a strict compliance environment, you might want to re-throw it.
  }
}
