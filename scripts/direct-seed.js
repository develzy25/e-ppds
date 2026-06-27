const Database = require('better-sqlite3');
const crypto = require('crypto');
const db = new Database('sqlite.db');

console.log('[Seed] Direct SQLite seeding started...');

// Enable foreign keys for this connection
db.pragma('foreign_keys = ON');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

try {
  // 1. Seed Pondok
  const pondokId = 'pon-1';
  const pondok = db.prepare('SELECT id FROM pondoks WHERE id = ?').get(pondokId);
  if (!pondok) {
    db.prepare(`
      INSERT INTO pondoks (id, name, address, phone, created_at, updated_at)
      VALUES (?, 'Pondok Pesantren Daarul Qur''an', 'Jl. Pesantren No. 1, Kediri', '081234567890', ?, ?)
    `).run(pondokId, new Date().toISOString(), new Date().toISOString());
    console.log('[Seed] Inserted Pondok');
  }

  // 2. Seed Periode
  const periodId = 'per-2026';
  const period = db.prepare('SELECT id FROM periodes WHERE id = ?').get(periodId);
  if (!period) {
    db.prepare(`
      INSERT INTO periodes (id, year_name, status, pondok_id, created_at, updated_at)
      VALUES (?, '2026-2027', 'Aktif', ?, ?, ?)
    `).run(periodId, pondokId, new Date().toISOString(), new Date().toISOString());
    console.log('[Seed] Inserted Periode');
  }

  // 3. Seed Master Roles
  const roles = [
    { id: 'role-super', name: 'Super Admin', description: 'Otoritas tertinggi sistem' },
    { id: 'role-ketum', name: 'Ketua Umum', description: 'Dewan harian / Pimpinan pondok' },
    { id: 'role-sekr', name: 'Sekretaris', description: 'Kesekretariatan & Persuratan' },
    { id: 'role-bend', name: 'Bendahara', description: 'Keuangan & Anggaran' },
    { id: 'role-keam', name: 'Keamanan', description: 'Ketertiban & Perizinan' },
    { id: 'role-pend', name: 'Pendidikan', description: 'Diniyah & Wajib Belajar' },
    { id: 'role-huma', name: 'Humas', description: 'Logistik & Hubungan Wali' },
  ];

  for (const r of roles) {
    const role = db.prepare('SELECT id FROM master_roles WHERE id = ?').get(r.id);
    if (!role) {
      db.prepare(`
        INSERT INTO master_roles (id, name, description, pondok_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(r.id, r.name, r.description, pondokId, new Date().toISOString(), new Date().toISOString());
      console.log(`[Seed] Inserted Role ${r.name}`);
    }
  }

  // 4. Seed/Update Users
  const users = [
    { id: 'usr-admin', name: 'Super Administrator', email: 'admin@ppds.id', password: 'admin123', pin: '999999', pondokId: 'pon-1' },
    { id: 'usr-dahlan', name: 'K.H. Ahmad Dahlan', email: 'dahlan@ppds.id', password: 'dahlan123', pin: '111111', pondokId: 'pon-1' },
    { id: 'usr-lulu', name: 'M. Lulu Khulaluddin', email: 'lulu@ppds.id', password: 'lulu123', pin: '222222', pondokId: 'pon-1' },
    { id: 'usr-fikri', name: 'Ust. Fikri Al-Hafidz', email: 'fikri@ppds.id', password: 'fikri123', pin: '333333', pondokId: 'pon-1' },
    { id: 'usr-zaid', name: 'H. Zaid Muzakki', email: 'zaid@ppds.id', password: 'zaid123', pin: '444444', pondokId: 'pon-1' },
    { id: 'usr-ali', name: 'Ust. M. Ali', email: 'ali@ppds.id', password: 'ali123', pin: '555555', pondokId: 'pon-1' },
  ];

  for (const u of users) {
    const hash = hashPassword(u.password);
    const check = db.prepare('SELECT id FROM users WHERE id = ?').get(u.id);
    if (!check) {
      db.prepare(`
        INSERT INTO users (id, name, email, password_hash, pin, pondok_id, created_at, updated_at, session_version, permission_version)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1)
      `).run(u.id, u.name, u.email, hash, u.pin, u.pondokId, new Date().toISOString(), new Date().toISOString());
      console.log(`[Seed] Inserted user ${u.name}`);
    } else {
      db.prepare('UPDATE users SET pin = ?, password_hash = ? WHERE id = ?').run(u.pin, hash, u.id);
      console.log(`[Seed] Updated user ${u.name} (PIN: ${u.pin})`);
    }
  }

  // 5. Link Roles
  const rolesMapping = [
    { userId: 'usr-admin', roleId: 'role-super' },
    { userId: 'usr-dahlan', roleId: 'role-ketum' },
    { userId: 'usr-lulu', roleId: 'role-sekr' },
    { userId: 'usr-fikri', roleId: 'role-keam' },
    { userId: 'usr-zaid', roleId: 'role-bend' },
    { userId: 'usr-ali', roleId: 'role-huma' },
  ];

  for (const m of rolesMapping) {
    const check = db.prepare('SELECT id FROM user_roles WHERE user_id = ? AND role_id = ?').get(m.userId, m.roleId);
    if (!check) {
      const id = `ur-${crypto.randomBytes(8).toString('hex')}`;
      db.prepare(`
        INSERT INTO user_roles (id, user_id, role_id, period_id, status, appointed_at)
        VALUES (?, ?, ?, 'per-2026', 'Aktif', ?)
      `).run(id, m.userId, m.roleId, new Date().toISOString());
      console.log(`[Seed] Mapped user ${m.userId} to role ${m.roleId}`);
    }
  }

  console.log('[Seed] Seeding completed successfully.');
} catch (e) {
  console.error('[Seed] Error during seeding:', e.message);
} finally {
  db.close();
}
