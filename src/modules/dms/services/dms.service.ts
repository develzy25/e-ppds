import { db } from '@/db';
import { eq, desc } from 'drizzle-orm';
import { dmsSurats, dmsSuratApprovals } from '../schemas/dms.schema';
import { insertAuditLog } from '@/modules/core/services/audit.service';
import { requirePermission } from '@/modules/core/services/rbac.service';

/**
 * Service untuk Document Management System
 */

/**
 * 1. Menghasilkan Nomor Surat secara otomatis (Format: OUT/PPDS/YYYY/MM/XXX)
 */
export async function generateNomorSurat(type: 'Keluar' | 'Keterangan'): Promise<string> {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  // Dalam production asli, kita harus query counter dari tabel sequence (DocumentSequences).
  // Untuk mockup ini, kita gunakan timestamp acak/singkat.
  const randomCounter = Math.floor(Math.random() * 900) + 100; 

  const code = type === 'Keluar' ? 'OUT' : 'KET';
  return `${code}/PPDS/${year}/${month}/${randomCounter}`;
}

/**
 * 2. Menyimpan Draft Surat Keluar Baru
 */
export async function createDraftSurat(
  data: {
    title: string;
    sender: string;
    recipient: string;
    templateId?: string;
    contentData?: string;
  },
  userId: string,
  userPermissions: string[]
) {
  requirePermission(userPermissions, 'dms.surat.create');

  const id = `srt-${Date.now()}`;
  const letterNumber = await generateNomorSurat('Keluar');

  await db.insert(dmsSurats).values({
    id,
    type: 'Keluar',
    letterNumber,
    title: data.title,
    sender: data.sender,
    recipient: data.recipient,
    date: new Date(),
    status: 'DRAFT',
    templateId: data.templateId || null,
    contentData: data.contentData || null,
    createdBy: userId,
  });

  await insertAuditLog({
    module: 'dms',
    entityName: 'dms_surats',
    entityId: id,
    action: 'CREATE',
    afterData: JSON.stringify(data),
    performedBy: userId,
  });

  return { id, letterNumber };
}

/**
 * 3. Workflow: Ajukan Draft untuk di-Review / Approve
 */
export async function requestApproval(suratId: string, requiredRole: string, userId: string, userPermissions: string[]) {
  requirePermission(userPermissions, 'dms.surat.request_approval');

  // Update surat status to REVIEW
  await db.update(dmsSurats).set({ status: 'REVIEW', updatedBy: userId }).where(eq(dmsSurats.id, suratId));

  // Insert approval step
  const approvalId = `app-${Date.now()}`;
  await db.insert(dmsSuratApprovals).values({
    id: approvalId,
    suratId,
    requiredRole,
    status: 'PENDING',
    createdBy: userId,
  });

  await insertAuditLog({
    module: 'dms',
    entityName: 'dms_surats',
    entityId: suratId,
    action: 'REQUEST_APPROVAL',
    performedBy: userId,
  });
}

/**
 * 4. Workflow: Approve Surat
 */
export async function approveSurat(approvalId: string, suratId: string, userId: string, userPermissions: string[]) {
  requirePermission(userPermissions, 'dms.surat.approve');

  // Update approval
  await db.update(dmsSuratApprovals).set({
    status: 'APPROVED',
    approvedBy: userId,
    approvedAt: new Date(),
    updatedBy: userId,
  }).where(eq(dmsSuratApprovals.id, approvalId));

  // Update surat status
  await db.update(dmsSurats).set({
    status: 'APPROVED',
    updatedBy: userId,
  }).where(eq(dmsSurats.id, suratId));

  await insertAuditLog({
    module: 'dms',
    entityName: 'dms_surats',
    entityId: suratId,
    action: 'APPROVE',
    performedBy: userId,
  });
}

export async function getAllSurats(userPermissions: string[]) {
  requirePermission(userPermissions, 'dms.surat.read');
  return db.select().from(dmsSurats).orderBy(desc(dmsSurats.createdAt));
}

export async function getSuratById(id: string, userPermissions: string[]) {
  requirePermission(userPermissions, 'dms.surat.read');
  const result = await db.select().from(dmsSurats).where(eq(dmsSurats.id, id)).limit(1);
  return result[0] || null;
}


