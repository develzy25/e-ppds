import { db } from '@/db';
import { users } from '@/db/schema';
import { hashPassword } from '@/modules/auth/services/auth.service'; // Adjust after Auth migration
import { eq } from 'drizzle-orm';

export const userSeeds = [
  { id: 'usr-admin', name: 'Super Administrator', email: 'admin@ppds.id', password: 'admin123', pin: '999999', roleId: 'role-super' },
  { id: 'usr-dahlan', name: 'K.H. Ahmad Dahlan', email: 'dahlan@ppds.id', password: 'dahlan123', pin: '111111', roleId: 'role-ketum' },
  { id: 'usr-lulu', name: 'M. Lulu Khulaluddin', email: 'lulu@ppds.id', password: 'lulu123', pin: '222222', roleId: 'role-sekr' },
  { id: 'usr-sekr-ppds', name: 'Sekretariat PPDS', email: 'sekretariat@ppds.id', password: 'sekretariat123', pin: '123456', roleId: 'role-sekr' },
  { id: 'usr-fikri', name: 'Ust. Fikri Al-Hafidz', email: 'fikri@ppds.id', password: 'fikri123', pin: '333333', roleId: 'role-keam' },
  { id: 'usr-zaid', name: 'H. Zaid Muzakki', email: 'zaid@ppds.id', password: 'zaid123', pin: '444444', roleId: 'role-bend' },
  { id: 'usr-ali', name: 'Ust. M. Ali', email: 'ali@ppds.id', password: 'ali123', pin: '555555', roleId: 'role-huma' },
];

export async function seedUsers(pondokId: string) {
  for (const u of userSeeds) {
    const userExists = await db.select().from(users).where(eq(users.id, u.id));
    if (userExists.length === 0) {
      await db.insert(users).values({
        id: u.id,
        name: u.name,
        email: u.email,
        passwordHash: hashPassword(u.password),
        pin: u.pin,
        pondokId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      await db.update(users).set({ pin: u.pin }).where(eq(users.id, u.id));
    }
  }
}
