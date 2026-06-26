import { db } from '@/db';
import { users, userSessions, userRoles, masterRoles, rolePermissions, masterPermissions, periodes } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import crypto from 'crypto';
import { signJwt, verifyJwt } from '../utils/jwt';

const JWT_SECRET = process.env.JWT_SECRET || 'ppds-erp-fallback-secret-key-123456';

export interface UserSessionData {
  userId: string;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
  pondokId: string;
}

/**
 * Membuat hash password sederhana (SHA-256) untuk tujuan keamanan dasar
 */
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Melakukan autentikasi user berdasarkan email, password, dan pondok_id.
 * Menghasilkan token session baru berupa signed JWT yang disimpan ke database.
 */
export async function loginUser(email: string, passwordHash: string, pondokId: string): Promise<string | null> {
  // Cari user berdasarkan email dan tenant pondok
  const foundUsers = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.email, email),
        eq(users.pondokId, pondokId)
      )
    );

  if (foundUsers.length === 0) return null;
  const user = foundUsers[0];

  // Bandingkan password hash
  if (user.passwordHash !== passwordHash) return null;

  // Cari periode aktif untuk pondok ini
  const activePeriods = await db
    .select()
    .from(periodes)
    .where(
      and(
        eq(periodes.pondokId, pondokId),
        eq(periodes.status, 'Aktif')
      )
    );
  const periodId = activePeriods.length > 0 ? activePeriods[0].id : 'default-period';

  // Muat roles dan permissions aktif untuk periode berjalan
  const activeRoles = await db
    .select({
      roleId: masterRoles.id,
      roleName: masterRoles.name,
    })
    .from(userRoles)
    .innerJoin(masterRoles, eq(userRoles.roleId, masterRoles.id))
    .where(
      and(
        eq(userRoles.userId, user.id),
        eq(userRoles.periodId, periodId),
        eq(userRoles.status, 'Aktif')
      )
    );

  const roles = activeRoles.map((r) => r.roleName);
  const roleIds = activeRoles.map((r) => r.roleId);

  let permissions: string[] = [];
  if (roleIds.length > 0) {
    const permissionsData = await db
      .select({
        permissionName: masterPermissions.name,
      })
      .from(rolePermissions)
      .innerJoin(masterPermissions, eq(rolePermissions.permissionId, masterPermissions.id))
      .where(
        inArray(rolePermissions.roleId, roleIds)
      );

    permissions = Array.from(new Set(permissionsData.map((p) => p.permissionName)));
  }

  // Generate payload JWT
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 Jam
  const payload = {
    userId: user.id,
    pondokId: user.pondokId,
    periodId,
    roles,
    permissions,
    sessionVersion: user.sessionVersion,
    permissionVersion: user.permissionVersion,
    exp: Date.now() + 24 * 60 * 60 * 1000,
  };

  // Sign JWT
  const token = await signJwt(payload, JWT_SECRET);

  // Simpan session token ke db
  await db.insert(userSessions).values({
    id: `sess-${crypto.randomBytes(8).toString('hex')}`,
    userId: user.id,
    token,
    expiresAt,
    createdAt: new Date().toISOString(),
  });

  return token;
}

/**
 * Menghapus session aktif (logout) & menaikkan sessionVersion agar semua JWT lama tidak valid
 */
export async function logoutUser(token: string): Promise<boolean> {
  const sessionResult = await db
    .select()
    .from(userSessions)
    .where(eq(userSessions.token, token))
    .limit(1);

  if (sessionResult.length > 0) {
    const session = sessionResult[0];
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (userResult.length > 0) {
      const user = userResult[0];
      await db
        .update(users)
        .set({ sessionVersion: user.sessionVersion + 1 })
        .where(eq(users.id, user.id));
    }
  }

  const result = await db.delete(userSessions).where(eq(userSessions.token, token));
  return (result.changes ?? 0) > 0;
}

/**
 * Menaikkan permissionVersion user untuk memaksa pembaruan JWT pada client
 */
export async function incrementPermissionVersion(userId: string) {
  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (userResult.length > 0) {
    const user = userResult[0];
    await db
      .update(users)
      .set({ permissionVersion: user.permissionVersion + 1 })
      .where(eq(users.id, userId));
  }
}

/**
 * Memvalidasi token session JWT dan memverifikasi versioning dengan database
 */
export async function validateSession(token: string): Promise<UserSessionData | null> {
  const payload = await verifyJwt(token, JWT_SECRET);
  if (!payload) return null;

  // Lakukan DB check ringan terhadap versi untuk mencocokkan revocation
  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.id, payload.userId))
    .limit(1);

  if (userResult.length === 0) return null;
  const user = userResult[0];

  // Jika versi sesi atau izin berubah, anggap sesi tidak valid
  if (user.sessionVersion !== payload.sessionVersion || user.permissionVersion !== payload.permissionVersion) {
    return null;
  }

  return {
    userId: payload.userId,
    name: user.name,
    email: user.email,
    roles: payload.roles,
    permissions: payload.permissions,
    pondokId: payload.pondokId,
  };
}

/**
 * Helper middleware-level untuk mengecek kepemilikan permission user
 */
export async function hasPermission(userId: string, permissionName: string, periodId: string): Promise<boolean> {
  const activeRoles = await db
    .select({
      roleId: userRoles.roleId,
    })
    .from(userRoles)
    .where(
      and(
        eq(userRoles.userId, userId),
        eq(userRoles.periodId, periodId),
        eq(userRoles.status, 'Aktif')
      )
    );

  const roleIds = activeRoles.map((r) => r.roleId);
  if (roleIds.length === 0) return false;

  const permissions = await db
    .select({
      id: masterPermissions.id,
    })
    .from(rolePermissions)
    .innerJoin(masterPermissions, eq(rolePermissions.permissionId, masterPermissions.id))
    .where(
      and(
        inArray(rolePermissions.roleId, roleIds),
        eq(masterPermissions.name, permissionName)
      )
    );

  return permissions.length > 0;
}
