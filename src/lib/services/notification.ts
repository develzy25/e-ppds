import { db } from '@/db';
import { notifications, notificationTargets, userRoles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

interface SendNotificationPayload {
  title: string;
  message: string;
  category: string; // "anggaran" | "perizinan" | "mutasi" | "umum"
  periodId: string;
  pondokId: string;
  targetUserIds: string[];
}

/**
 * Mengirim notifikasi terpusat ke database dan menargetkan daftar pengurus tertentu
 */
export async function sendNotification({
  title,
  message,
  category,
  periodId,
  pondokId,
  targetUserIds,
}: SendNotificationPayload): Promise<string> {
  const notifId = `notif-${crypto.randomBytes(8).toString('hex')}`;

  // Insert notifikasi master
  await db.insert(notifications).values({
    id: notifId,
    title,
    message,
    category,
    periodId,
    pondokId,
  });

  // Bulk insert target user penerima notifikasi
  if (targetUserIds.length > 0) {
    const targetsToInsert = targetUserIds.map((userId) => ({
      id: `target-${crypto.randomBytes(8).toString('hex')}`,
      notificationId: notifId,
      userId,
      isRead: false,
    }));
    await db.insert(notificationTargets).values(targetsToInsert);
  }

  return notifId;
}

interface SystemEventPayload {
  billingMonth?: string;
  santriName?: string;
  amount?: number;
  createdByUserId?: string;
  letterNumber?: string;
  letterTitle?: string;
  endDate?: string;
  pjUserId?: string;
  itemName?: string;
  unitName?: string;
  stock?: number;
  unit?: string;
}

/**
 * Handler Event System universal untuk memicu pembuatan notifikasi berdasarkan tipe event aplikasi
 */
export async function handleSystemEventNotification(
  eventType: 'invoice_created' | 'surat_approved' | 'izin_disetujui' | 'stok_habis',
  payload: SystemEventPayload,
  periodId: string,
  pondokId: string
): Promise<void> {
  const targetUserIds: string[] = [];

  switch (eventType) {
    case 'invoice_created':
      // Notifikasi ke seluruh Bendahara (role bendahara)
      const bendaharas = await db
        .select({ userId: userRoles.userId })
        .from(userRoles)
        .where(
          and(
            eq(userRoles.periodId, periodId),
            eq(userRoles.status, 'Aktif')
          )
        ); // Sederhana: kirim ke pengurus aktif terkait pembayaran
      targetUserIds.push(...bendaharas.map((b) => b.userId));
      
      await sendNotification({
        title: 'Tagihan SPP Baru Diterbitkan',
        message: `Tagihan SPP bulan ${payload.billingMonth || ''} untuk santri ${payload.santriName || ''} sebesar Rp ${(payload.amount || 0).toLocaleString()} telah dibuat.`,
        category: 'anggaran',
        periodId,
        pondokId,
        targetUserIds,
      });
      break;

    case 'surat_approved':
      // Kirim notifikasi ke Sekretaris Umum & Pembuat Surat
      if (payload.createdByUserId) {
        targetUserIds.push(payload.createdByUserId);
      }
      
      await sendNotification({
        title: 'Surat Resmi Disetujui',
        message: `Surat nomor ${payload.letterNumber || ''} (${payload.letterTitle || ''}) telah disetujui dewan harian.`,
        category: 'umum',
        periodId,
        pondokId,
        targetUserIds,
      });
      break;

    case 'izin_disetujui':
      // Kirim notifikasi ke Keamanan (petugas gerbang) & Ketua Blok terkait
      const keamanans = await db
        .select({ userId: userRoles.userId })
        .from(userRoles)
        .where(
          and(
            eq(userRoles.periodId, periodId),
            eq(userRoles.status, 'Aktif')
          )
        );
      targetUserIds.push(...keamanans.map((k) => k.userId));

      await sendNotification({
        title: 'Perizinan Santri Disetujui',
        message: `Izin keluar pondok santri ${payload.santriName || ''} telah disetujui. Berlaku s/d ${payload.endDate || ''}.`,
        category: 'perizinan',
        periodId,
        pondokId,
        targetUserIds,
      });
      break;

    case 'stok_habis':
      // Kirim notifikasi ke penanggung jawab seksi / unit terkait
      if (payload.pjUserId) {
        targetUserIds.push(payload.pjUserId);
      }

      await sendNotification({
        title: 'Stok Logistik Menipis',
        message: `Stok barang "${payload.itemName || ''}" di unit ${payload.unitName || ''} tersisa ${payload.stock || 0} ${payload.unit || ''}. Segera lakukan restock!`,
        category: 'umum',
        periodId,
        pondokId,
        targetUserIds,
      });
      break;
  }
}
