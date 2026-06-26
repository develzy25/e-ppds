import { db } from '@/db';
import {
  pondoks,
  periodes,
  users,
  masterRoles,
  masterPermissions,
  rolePermissions,
  userRoles,
  labClients,
  labBillingRates,
  labServiceRates,
  approvalPolicies
} from '@/db/schema';
import { hashPassword } from './auth';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

/**
 * Melakukan inisialisasi/seeding data awal pondok, periode, pengurus, role, dan matriks permission
 */
export async function seedDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Inisialisasi Pondok Tenant Pertama
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

    // 2. Inisialisasi Periode Kepengurusan Aktif
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

    // 3. Inisialisasi Master Roles
    const rolesList = [
      { id: 'role-super', name: 'Super Admin', description: 'Otoritas tertinggi sistem' },
      { id: 'role-ketum', name: 'Ketua Umum', description: 'Dewan harian / Pimpinan pondok' },
      { id: 'role-sekr', name: 'Sekretaris', description: 'Kesekretariatan & Persuratan' },
      { id: 'role-bend', name: 'Bendahara', description: 'Keuangan & Anggaran' },
      { id: 'role-keam', name: 'Keamanan', description: 'Ketertiban & Perizinan' },
      { id: 'role-pend', name: 'Pendidikan', description: 'Diniyah & Wajib Belajar' },
      { id: 'role-huma', name: 'Humas', description: 'Logistik & Hubungan Wali' },
    ];

    for (const role of rolesList) {
      const roleExists = await db.select().from(masterRoles).where(eq(masterRoles.id, role.id));
      if (roleExists.length === 0) {
        await db.insert(masterRoles).values({
          ...role,
          pondokId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // 4. Inisialisasi Master Permissions
    const permissionsList = [
      // Santri
      { id: 'perm-s-v', name: 'santri.view', description: 'Melihat data santri' },
      { id: 'perm-s-c', name: 'santri.create', description: 'Membuat data santri baru' },
      { id: 'perm-s-u', name: 'santri.update', description: 'Memperbarui data santri' },
      { id: 'perm-s-d', name: 'santri.delete', description: 'Menghapus data santri' },
      // Perizinan
      { id: 'perm-p-v', name: 'perizinan.view', description: 'Melihat perizinan' },
      { id: 'perm-p-c', name: 'perizinan.create', description: 'Mengajukan izin baru' },
      { id: 'perm-p-a', name: 'perizinan.approve', description: 'Menyetujui izin keluar' },
      // Persuratan
      { id: 'perm-l-v', name: 'surat.view', description: 'Melihat surat menyurat' },
      { id: 'perm-l-c', name: 'surat.create', description: 'Membuat draft surat baru' },
      { id: 'perm-l-a', name: 'surat.approve', description: 'Menyetujui / menandatangani surat' },
      // Keuangan
      { id: 'perm-f-v', name: 'keuangan.view', description: 'Melihat kas & billing' },
      { id: 'perm-f-c', name: 'keuangan.create', description: 'Mencatat transaksi keuangan' },
      { id: 'perm-f-m', name: 'keuangan.manage', description: 'Mengelola alokasi anggaran' },
      // Inventaris
      { id: 'perm-i-v', name: 'inventaris.view', description: 'Melihat inventaris barang' },
      { id: 'perm-i-m', name: 'inventaris.manage', description: 'Mutasi & penyesuaian barang' },
    ];

    for (const perm of permissionsList) {
      const permExists = await db.select().from(masterPermissions).where(eq(masterPermissions.id, perm.id));
      if (permExists.length === 0) {
        await db.insert(masterPermissions).values({
          ...perm,
          pondokId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // 5. Pemetaan Role-Permissions (Mapping)
    const mappingList: { roleId: string; permissionId: string }[] = [];

    // Super Admin mendapat semua permission
    for (const perm of permissionsList) {
      mappingList.push({ roleId: 'role-super', permissionId: perm.id });
    }

    // Ketua Umum
    mappingList.push(
      { roleId: 'role-ketum', permissionId: 'perm-s-v' },
      { roleId: 'role-ketum', permissionId: 'perm-p-v' },
      { roleId: 'role-ketum', permissionId: 'perm-p-a' },
      { roleId: 'role-ketum', permissionId: 'perm-l-v' },
      { roleId: 'role-ketum', permissionId: 'perm-l-a' },
      { roleId: 'role-ketum', permissionId: 'perm-f-v' },
      { roleId: 'role-ketum', permissionId: 'perm-f-m' }
    );

    // Sekretaris
    mappingList.push(
      { roleId: 'role-sekr', permissionId: 'perm-s-v' },
      { roleId: 'role-sekr', permissionId: 'perm-s-c' },
      { roleId: 'role-sekr', permissionId: 'perm-s-u' },
      { roleId: 'role-sekr', permissionId: 'perm-l-v' },
      { roleId: 'role-sekr', permissionId: 'perm-l-c' }
    );

    // Bendahara
    mappingList.push(
      { roleId: 'role-bend', permissionId: 'perm-f-v' },
      { roleId: 'role-bend', permissionId: 'perm-f-c' },
      { roleId: 'role-bend', permissionId: 'perm-f-m' }
    );

    // Keamanan
    mappingList.push(
      { roleId: 'role-keam', permissionId: 'perm-s-v' },
      { roleId: 'role-keam', permissionId: 'perm-p-v' },
      { roleId: 'role-keam', permissionId: 'perm-p-c' },
      { roleId: 'role-keam', permissionId: 'perm-p-a' }
    );

    // Seed Mapping jika kosong
    const existingMappings = await db.select().from(rolePermissions);
    if (existingMappings.length === 0) {
      const inserts = mappingList.map((m) => ({
        id: `map-${crypto.randomBytes(8).toString('hex')}`,
        roleId: m.roleId,
        permissionId: m.permissionId,
      }));
      await db.insert(rolePermissions).values(inserts);
    }

    // 6. Seed Data User (Super Admin & Sekretaris Umum)
    const userAdminId = 'usr-admin';
    const userLuluId = 'usr-lulu';

    const adminExists = await db.select().from(users).where(eq(users.id, userAdminId));
    if (adminExists.length === 0) {
      await db.insert(users).values({
        id: userAdminId,
        name: 'Super Administrator',
        email: 'admin@ppds.id',
        passwordHash: hashPassword('admin123'),
        pondokId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Hubungkan ke Role Super Admin
      await db.insert(userRoles).values({
        id: `ur-${crypto.randomBytes(8).toString('hex')}`,
        userId: userAdminId,
        roleId: 'role-super',
        periodId,
        status: 'Aktif',
        appointedAt: new Date().toISOString(),
      });
    }

    const luluExists = await db.select().from(users).where(eq(users.id, userLuluId));
    if (luluExists.length === 0) {
      await db.insert(users).values({
        id: userLuluId,
        name: 'M. Lulu Khulaluddin',
        email: 'lulu@ppds.id',
        passwordHash: hashPassword('lulu123'),
        pondokId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Hubungkan ke Role Sekretaris
      await db.insert(userRoles).values({
        id: `ur-${crypto.randomBytes(8).toString('hex')}`,
        userId: userLuluId,
        roleId: 'role-sekr',
        periodId,
        status: 'Aktif',
        appointedAt: new Date().toISOString(),
      });
    }

    // 7. Seed Lab Clients (PC-01 s/d PC-05)
    const clientExists = await db.select().from(labClients);
    if (clientExists.length === 0) {
      const pcs = ['PC-01', 'PC-02', 'PC-03', 'PC-04', 'PC-05'];
      for (const pc of pcs) {
        await db.insert(labClients).values({
          id: `pc-${crypto.randomBytes(8).toString('hex')}`,
          kodePc: pc,
          namaPc: `Komputer ${pc}`,
          hostname: `client-${pc.toLowerCase()}`,
          macAddress: `00:1A:2B:3C:4D:0${pc.charAt(4)}`,
          status: 'Idle',
          pondokId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // 8. Seed Lab Billing Rates
    const ratesExists = await db.select().from(labBillingRates);
    if (ratesExists.length === 0) {
      const rates = [
        { id: 'rate-reg', name: 'Reguler', hourPrice: 3000 },
        { id: 'rate-game', name: 'Gaming', hourPrice: 5000 },
        { id: 'rate-train', name: 'Pelatihan', hourPrice: 4000 },
      ];
      for (const r of rates) {
        await db.insert(labBillingRates).values({
          id: r.id,
          namaTarif: r.name,
          hargaPerJam: r.hourPrice,
          hargaPerMenit: r.hourPrice / 60,
          aktif: 1,
          pondokId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // 9. Seed Lab Service Rates (Jasa Lab)
    const servicesExists = await db.select().from(labServiceRates);
    if (servicesExists.length === 0) {
      const services = [
        { id: 'svc-print-black', name: 'Print Hitam Putih', unit: 'Lembar', price: 500 },
        { id: 'svc-print-color', name: 'Print Warna', unit: 'Lembar', price: 1500 },
        { id: 'svc-copy', name: 'Fotocopy', unit: 'Lembar', price: 250 },
        { id: 'svc-laminating', name: 'Laminating', unit: 'Lembar', price: 3000 },
        { id: 'svc-jilid', name: 'Jilid', unit: 'Buku', price: 5000 },
        { id: 'svc-typing', name: 'Pengetikan', unit: 'Halaman', price: 2500 },
      ];
      for (const s of services) {
        await db.insert(labServiceRates).values({
          id: s.id,
          namaJasa: s.name,
          satuan: s.unit,
          harga: s.price,
          aktif: 1,
          pondokId,
        });
      }
    }

    // 10. Seed Approval Policies
    const policiesExists = await db.select().from(approvalPolicies);
    if (policiesExists.length === 0) {
      const defaultPolicies = [
        {
          id: 'pol-rab-low',
          entityType: 'RAB',
          minAmount: 0,
          maxAmount: 100000,
          requiredRoles: JSON.stringify(['role-keam']), // Kasie Keamanan
          version: 1,
          isActive: 1,
          periodId,
          pondokId,
        },
        {
          id: 'pol-rab-mid',
          entityType: 'RAB',
          minAmount: 100001,
          maxAmount: 1000000,
          requiredRoles: JSON.stringify(['role-keam', 'role-bend']), // Kasie -> Bendahara
          version: 1,
          isActive: 1,
          periodId,
          pondokId,
        },
        {
          id: 'pol-rab-high',
          entityType: 'RAB',
          minAmount: 1000001,
          maxAmount: null as number | null,
          requiredRoles: JSON.stringify(['role-keam', 'role-bend', 'role-ketum']), // Kasie -> Bendahara -> Ketua Umum
          version: 1,
          isActive: 1,
          periodId,
          pondokId,
        },
        {
          id: 'pol-skkb',
          entityType: 'SKKB',
          minAmount: 0,
          maxAmount: null as number | null,
          requiredRoles: JSON.stringify(['role-keam']), // Kasie Keamanan saja
          version: 1,
          isActive: 1,
          periodId,
          pondokId,
        },
        {
          id: 'pol-izin',
          entityType: 'Perizinan',
          minAmount: 0,
          maxAmount: null as number | null,
          requiredRoles: JSON.stringify(['role-keam']), // Kasie Keamanan saja
          version: 1,
          isActive: 1,
          periodId,
          pondokId,
        },
      ];

      for (const pol of defaultPolicies) {
        await db.insert(approvalPolicies).values(pol);
      }
    }

    return { success: true, message: 'Database seeding completed successfully' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message: `Database seeding failed: ${errorMessage}` };
  }
}


