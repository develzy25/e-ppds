import { db } from '@/db';
import { approvalPolicies, approvalRequests, approvalSteps, approvalHistories, userRoles } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import crypto from 'crypto';
import { writeAuditLog } from './audit';

/**
 * Mengevaluasi alur persetujuan secara dinamis berdasarkan nominal transaksi (RAB)
 * dan kebijakan (approval_policies) yang dikonfigurasi di database.
 */
export async function evaluateApprovalWorkflow(
  entityType: string,
  amount: number,
  periodId: string,
  pondokId: string
): Promise<string[]> {
  const policies = await db
    .select()
    .from(approvalPolicies)
    .where(
      and(
        eq(approvalPolicies.entityType, entityType),
        eq(approvalPolicies.pondokId, pondokId),
        eq(approvalPolicies.periodId, periodId),
        eq(approvalPolicies.isActive, 1)
      )
    );

  if (policies.length === 0) {
    // Fallback default jika tidak ada kebijakan yang terkonfigurasi
    if (entityType === 'RAB') {
      return ['role-bend', 'role-ketum'];
    }
    return ['role-keam'];
  }

  // Cocokkan nominal dana dengan kebijakan yang sesuai
  const matchingPolicy = policies.find((p) => {
    const min = p.minAmount;
    const max = p.maxAmount === null ? Infinity : p.maxAmount;
    return amount >= min && amount <= max;
  });

  if (!matchingPolicy) {
    // Fallback: gunakan kebijakan pertama yang tersedia
    return JSON.parse(policies[0].requiredRoles) as string[];
  }

  return JSON.parse(matchingPolicy.requiredRoles) as string[];
}

/**
 * Memulai workflow persetujuan baru untuk entitas tertentu (RAB, Izin, Surat, dll)
 */
export async function startApproval(
  entityType: string,
  entityId: string,
  amount: number,
  userId: string,
  periodId: string,
  pondokId: string,
  overrideRoleIds?: string[]
): Promise<string> {
  const requestId = `req-${crypto.randomBytes(8).toString('hex')}`;

  // 1. Simpan Request utama
  await db.insert(approvalRequests).values({
    id: requestId,
    entityType,
    entityId,
    status: 'Pending',
    periodId,
    pondokId,
  });

  // 2. Evaluasi kebijakan persetujuan untuk mendapatkan roles yang harus menyetujui
  const requiredRoleIds = overrideRoleIds || await evaluateApprovalWorkflow(entityType, amount, periodId, pondokId);

  // 3. Simpan tahapan persetujuan (approval steps) berurutan
  if (requiredRoleIds.length > 0) {
    const stepsToInsert = requiredRoleIds.map((roleId, index) => ({
      id: `step-${crypto.randomBytes(8).toString('hex')}`,
      approvalRequestId: requestId,
      stepOrder: index + 1,
      roleId,
      status: 'Pending',
    }));
    await db.insert(approvalSteps).values(stepsToInsert);
  }

  // 4. Catat ke audit log
  await writeAuditLog({
    userId,
    action: 'APPROVAL_START',
    details: { requestId, entityType, entityId, amount, requiredRoleIds },
    periodId,
    pondokId,
  });

  return requestId;
}

/**
 * Menyetujui tahapan aktif persetujuan
 */
export async function approveStep(
  requestId: string,
  userId: string,
  note?: string
): Promise<{ success: boolean; isFullyApproved: boolean; message: string }> {
  // Ambil tahapan persetujuan terurut
  const steps = await db
    .select()
    .from(approvalSteps)
    .where(eq(approvalSteps.approvalRequestId, requestId))
    .orderBy(asc(approvalSteps.stepOrder));

  if (steps.length === 0) {
    return { success: false, isFullyApproved: false, message: 'Tahapan persetujuan tidak ditemukan' };
  }

  // Cari step aktif yang bertatus 'Pending'
  const activeStep = steps.find((s) => s.status === 'Pending');
  if (!activeStep) {
    return { success: false, isFullyApproved: true, message: 'Seluruh tahapan persetujuan sudah selesai' };
  }

  // Cari request utama
  const requests = await db
    .select()
    .from(approvalRequests)
    .where(eq(approvalRequests.id, requestId));
  
  if (requests.length === 0) {
    return { success: false, isFullyApproved: false, message: 'Request persetujuan tidak ditemukan' };
  }
  const request = requests[0];

  // Pastikan user memiliki role yang bersangkutan
  const userRolesData = await db
    .select()
    .from(userRoles)
    .where(
      and(
        eq(userRoles.userId, userId),
        eq(userRoles.roleId, activeStep.roleId),
        eq(userRoles.periodId, request.periodId),
        eq(userRoles.status, 'Aktif')
      )
    );

  if (userRolesData.length === 0) {
    return { success: false, isFullyApproved: false, message: 'User tidak memiliki otoritas role untuk menyetujui tahapan ini' };
  }

  // Update step status ke 'Approved'
  await db
    .update(approvalSteps)
    .set({ status: 'Approved' })
    .where(eq(approvalSteps.id, activeStep.id));

  // Tulis riwayat persetujuan
  const historyId = `hist-${crypto.randomBytes(8).toString('hex')}`;
  await db.insert(approvalHistories).values({
    id: historyId,
    approvalRequestId: requestId,
    userId,
    action: 'Approved',
    note: note || 'Disetujui',
    timestamp: new Date().toISOString(),
  });

  // Periksa apakah seluruh tahapan selesai
  const remainingSteps = steps.filter((s) => s.id !== activeStep.id && s.status === 'Pending');
  const isFullyApproved = remainingSteps.length === 0;

  if (isFullyApproved) {
    await db
      .update(approvalRequests)
      .set({ status: 'Approved' })
      .where(eq(approvalRequests.id, requestId));
  }

  // Catat ke audit log
  await writeAuditLog({
    userId,
    action: 'APPROVAL_APPROVE',
    details: { requestId, activeStepId: activeStep.id, isFullyApproved, note },
    periodId: request.periodId,
    pondokId: request.pondokId,
  });

  return { success: true, isFullyApproved, message: 'Tahapan berhasil disetujui' };
}

/**
 * Menolak persetujuan (akan membatalkan seluruh request)
 */
export async function rejectStep(
  requestId: string,
  userId: string,
  note?: string
): Promise<{ success: boolean; message: string }> {
  const steps = await db
    .select()
    .from(approvalSteps)
    .where(eq(approvalSteps.approvalRequestId, requestId))
    .orderBy(asc(approvalSteps.stepOrder));

  const activeStep = steps.find((s) => s.status === 'Pending');
  if (!activeStep) {
    return { success: false, message: 'Tidak ada tahapan aktif yang dapat ditolak' };
  }

  const requests = await db
    .select()
    .from(approvalRequests)
    .where(eq(approvalRequests.id, requestId));
  
  if (requests.length === 0) {
    return { success: false, message: 'Request persetujuan tidak ditemukan' };
  }
  const request = requests[0];

  // Validasi role
  const userRolesData = await db
    .select()
    .from(userRoles)
    .where(
      and(
        eq(userRoles.userId, userId),
        eq(userRoles.roleId, activeStep.roleId),
        eq(userRoles.periodId, request.periodId),
        eq(userRoles.status, 'Aktif')
      )
    );

  if (userRolesData.length === 0) {
    return { success: false, message: 'User tidak memiliki otoritas role untuk menolak tahapan ini' };
  }

  // Batalkan step aktif & request utama
  await db
    .update(approvalSteps)
    .set({ status: 'Rejected' })
    .where(eq(approvalSteps.id, activeStep.id));

  await db
    .update(approvalRequests)
    .set({ status: 'Rejected' })
    .where(eq(approvalRequests.id, requestId));

  // Tulis history
  const historyId = `hist-${crypto.randomBytes(8).toString('hex')}`;
  await db.insert(approvalHistories).values({
    id: historyId,
    approvalRequestId: requestId,
    userId,
    action: 'Rejected',
    note: note || 'Ditolak',
    timestamp: new Date().toISOString(),
  });

  // Catat ke audit log
  await writeAuditLog({
    userId,
    action: 'APPROVAL_REJECT',
    details: { requestId, activeStepId: activeStep.id, note },
    periodId: request.periodId,
    pondokId: request.pondokId,
  });

  return { success: true, message: 'Persetujuan berhasil ditolak' };
}

/**
 * Membatalkan/menarik kembali pengajuan persetujuan oleh pembuat
 */
export async function cancelApproval(requestId: string, userId: string): Promise<boolean> {
  const requests = await db
    .select()
    .from(approvalRequests)
    .where(eq(approvalRequests.id, requestId))
    .limit(1);

  if (requests.length === 0) return false;
  const request = requests[0];

  const result = await db
    .update(approvalRequests)
    .set({ status: 'Rejected' })
    .where(eq(approvalRequests.id, requestId));

  const success = (result.changes ?? 0) > 0;

  if (success) {
    await writeAuditLog({
      userId,
      action: 'APPROVAL_CANCEL',
      details: { requestId },
      periodId: request.periodId,
      pondokId: request.pondokId,
    });
  }

  return success;
}
