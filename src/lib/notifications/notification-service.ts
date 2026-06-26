import { db } from '@/db';
import { notifications, notificationTargets } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Memperoleh seluruh notifikasi aktif untuk pengguna tertentu
 */
export async function getNotificationsForUser(
  userId: string,
  pondokId: string,
  periodId: string,
  unreadOnly = false
) {
  const conditions = [
    eq(notificationTargets.userId, userId),
    eq(notifications.pondokId, pondokId),
    eq(notifications.periodId, periodId),
  ];

  if (unreadOnly) {
    conditions.push(eq(notificationTargets.isRead, false));
  }

  return db
    .select({
      targetId: notificationTargets.id,
      notificationId: notifications.id,
      title: notifications.title,
      message: notifications.message,
      category: notifications.category,
      isRead: notificationTargets.isRead,
    })
    .from(notificationTargets)
    .innerJoin(notifications, eq(notificationTargets.notificationId, notifications.id))
    .where(and(...conditions));
}

/**
 * Menandai satu notifikasi tertentu sebagai terbaca
 */
export async function markAsRead(targetId: string, userId: string) {
  await db
    .update(notificationTargets)
    .set({ isRead: true })
    .where(
      and(
        eq(notificationTargets.id, targetId),
        eq(notificationTargets.userId, userId)
      )
    );
}

/**
 * Menandai seluruh notifikasi pengguna sebagai terbaca
 */
export async function markAllAsRead(userId: string, pondokId: string, periodId: string) {
  // Temukan semua target ID milik user untuk pondok & periode aktif
  const userTargets = await db
    .select({ id: notificationTargets.id })
    .from(notificationTargets)
    .innerJoin(notifications, eq(notificationTargets.notificationId, notifications.id))
    .where(
      and(
        eq(notificationTargets.userId, userId),
        eq(notifications.pondokId, pondokId),
        eq(notifications.periodId, periodId),
        eq(notificationTargets.isRead, false)
      )
    );

  if (userTargets.length === 0) return;

  const targetIds = userTargets.map((t) => t.id);

  for (const id of targetIds) {
    await db
      .update(notificationTargets)
      .set({ isRead: true })
      .where(eq(notificationTargets.id, id));
  }
}
