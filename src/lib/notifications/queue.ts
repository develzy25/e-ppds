import { db } from '@/db';
import { notifications, notificationTargets } from '@/db/schema';
import crypto from 'crypto';

export interface PushNotificationInput {
  title: string;
  message: string;
  category: string;
  recipientUserIds: string[];
  periodId: string;
  pondokId: string;
}

/**
 * Pushes a notification event and maps it to multiple recipients (event-recipient architecture).
 */
export async function pushNotificationEvent({
  title,
  message,
  category,
  recipientUserIds,
  periodId,
  pondokId,
}: PushNotificationInput): Promise<string> {
  const notificationId = `notif-${crypto.randomBytes(8).toString('hex')}`;

  // 1. Simpan event utama ke tabel notifications
  await db.insert(notifications).values({
    id: notificationId,
    title,
    message,
    category,
    periodId,
    pondokId,
  });

  // 2. Petakan ke penerima (recipients) di tabel notification_targets
  if (recipientUserIds.length > 0) {
    const targetsToInsert = recipientUserIds.map((userId) => ({
      id: `target-${crypto.randomBytes(8).toString('hex')}`,
      notificationId,
      userId,
      isRead: false,
    }));
    await db.insert(notificationTargets).values(targetsToInsert);
  }

  return notificationId;
}
