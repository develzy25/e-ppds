import { db } from '@/db';
import { pondoks, periodes, labComputers, labTariffs, labServices, approvalPolicies } from '@/db/schema';
import crypto from 'crypto';
import { seedRoles, seedUserRoles } from './seed.roles';
import { seedPermissions, seedRolePermissions } from './seed.permissions';
import { seedUsers } from './seed.users';

export async function seedDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    const pondokId = 'pon-1';
    const pondokExists = await db.select().from(pondoks);
    if (pondokExists.length === 0) {
      await db.insert(pondoks).values({
        id: pondokId,
        name: 'Pondok Pesantren Daarul Qur\'an',
        address: 'Jl. Pesantren No. 1, Kediri',
        phone: '081234567890',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    const periodId = 'per-2026';
    const periodExists = await db.select().from(periodes);
    if (periodExists.length === 0) {
      await db.insert(periodes).values({
        id: periodId,
        yearName: '2026-2027',
        status: 'Aktif',
        pondokId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    await seedRoles(pondokId);
    await seedPermissions(pondokId);
    await seedRolePermissions();
    await seedUsers(pondokId);
    await seedUserRoles(periodId);

    // Other seeds...
    const clientExists = await db.select().from(labComputers);
    if (clientExists.length === 0) {
      const pcs = ['PC-01', 'PC-02', 'PC-03', 'PC-04', 'PC-05'];
      for (const pc of pcs) {
        await db.insert(labComputers).values({
          id: `pc-${crypto.randomBytes(8).toString('hex')}`,
          name: pc,
          status: 'Available',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    const ratesExists = await db.select().from(labTariffs);
    if (ratesExists.length === 0) {
      const rates = [
        { id: 'rate-reg', name: 'Reguler', hourPrice: 3000 },
        { id: 'rate-game', name: 'Gaming', hourPrice: 5000 },
        { id: 'rate-train', name: 'Pelatihan', hourPrice: 4000 },
      ];
      for (const r of rates) {
        await db.insert(labTariffs).values({ id: r.id, name: r.name, pricePerHour: r.hourPrice, isActive: true });
      }
    }

    const servicesExists = await db.select().from(labServices);
    if (servicesExists.length === 0) {
      const services = [
        { id: 'svc-print-black', name: 'Print Hitam Putih', price: 500 },
        { id: 'svc-print-color', name: 'Print Warna', price: 1500 },
        { id: 'svc-copy', name: 'Fotocopy', price: 250 },
      ];
      for (const s of services) {
        await db.insert(labServices).values({ id: s.id, name: s.name, price: s.price, isActive: true });
      }
    }

    const policiesExists = await db.select().from(approvalPolicies);
    if (policiesExists.length === 0) {
      await db.insert(approvalPolicies).values({
        id: 'pol-rab-low',
        entityType: 'RAB',
        minAmount: 0,
        maxAmount: 100000,
        requiredRoles: JSON.stringify(['role-keam']),
        version: 1,
        isActive: 1,
        periodId,
        pondokId,
      });
    }

    return { success: true, message: 'Database seeding completed successfully' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message: `Database seeding failed: ${errorMessage}` };
  }
}
