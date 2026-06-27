import { systemAuditLogs } from '@/modules/core/schemas/core.schema';
import { db } from '@/db';
import { users, userSessions, userRoles, masterRoles, rolePermissions, masterPermissions, periodes } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import crypto from 'crypto';
import { signJwt, verifyJwt } from '@/modules/auth/jwt';
import { cacheProvider } from '@/infrastructure/cache/cache.provider';
import { parseUserAgent } from '@/shared/utils/user-agent';
import { cookies, headers } from 'next/headers';
import { cache } from 'react';

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
  const token = await signJwt(payload);

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
  const cacheKey = `sess-val-${token}`;
  const cached = await cacheProvider.get<UserSessionData>(cacheKey);
  if (cached) {
    return cached;
  }

  const payload = await verifyJwt(token);
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

  // Update session activity dynamically (sliding session)
  await updateSessionActivity(token);

  const userData: UserSessionData = {
    userId: payload.userId,
    name: user.name,
    email: user.email,
    roles: payload.roles,
    permissions: payload.permissions,
    pondokId: payload.pondokId,
  };

  // Cache user validation for 60 seconds
  await cacheProvider.set(cacheKey, userData, 60);

  return userData;
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

/**
 * Melakukan autentikasi user berdasarkan PIN dan pondok_id secara aman.
 */
export async function loginUserByPin(
  pin: string,
  pondokId: string,
  userAgent: string,
  ipAddress: string
): Promise<{ success: boolean; token?: string; error?: string; code?: string }> {
  // Cari user berdasarkan PIN dan tenant pondok
  const foundUsers = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.pin, pin),
        eq(users.pondokId, pondokId)
      )
    );

  if (foundUsers.length === 0) {
    // Catat log gagal masuk
    await logSecurityEvent({
      userId: 'guest',
      action: 'FAILED_LOGIN',
      remarks: `Attempted PIN: ${pin}. IP: ${ipAddress}. Pondok: ${pondokId}`,
      userAgent,
      ipAddress,
    });
    return { success: false, error: 'Kredensial login tidak valid', code: 'AUTH-401' };
  }

  const user = foundUsers[0];

  // Cek jika akun sedang terkunci karena brute-force
  if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    const waitTime = Math.ceil((new Date(user.lockedUntil).getTime() - Date.now()) / 60000);
    return {
      success: false,
      error: `Akun terkunci sementara karena terlalu banyak percobaan salah. Coba lagi dalam ${waitTime} menit.`,
      code: 'AUTH-423',
    };
  }

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

  // Muat roles & permissions aktif
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

  // Jika memiliki role Super Admin, tambahkan permission global SUPER_ADMIN
  if (roles.some(r => r.toLowerCase() === 'super admin')) {
    permissions.push('SUPER_ADMIN');
  }

  // Reset failed login attempts
  await db
    .update(users)
    .set({ failedLoginAttempts: 0, lockedUntil: null })
    .where(eq(users.id, user.id));

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
  const token = await signJwt(payload);

  const { browser, os, device } = parseUserAgent(userAgent);

  // Simpan session token ke db
  const sessionId = `sess-${crypto.randomBytes(8).toString('hex')}`;
  await db.insert(userSessions).values({
    id: sessionId,
    userId: user.id,
    token,
    expiresAt,
    createdAt: new Date().toISOString(),
    ipAddress,
    device,
    browser,
    os,
    userAgent,
    lastActivity: new Date().toISOString(),
  });

  // Log successful login
  await logSecurityEvent({
    userId: user.id,
    action: 'LOGIN',
    remarks: `User: ${user.name}. IP: ${ipAddress}. OS: ${os}. Browser: ${browser}`,
    userAgent,
    ipAddress,
  });

  return { success: true, token };
}

/**
 * Membaca cookie session_token dan memulihkan profil user terotentikasi saat ini (Server Action helper).
 */
export const getCurrentUser = cache(async (): Promise<UserSessionData | null> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return null;
    return validateSession(token);
  } catch (err) {
    console.error('Failed to get current user in server side:', err);
    return null;
  }
});

/**
 * Menyimpan log audit keamanan (Audit Log Security Event)
 */
export async function logSecurityEvent(params: {
  userId: string;
  action: 'LOGIN' | 'FAILED_LOGIN' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'ROLE_CHANGE' | 'PERMISSION_CHANGE';
  remarks?: string;
  userAgent?: string;
  ipAddress?: string;
}) {
  try {
    const { browser, os, device } = parseUserAgent(params.userAgent || '');
    
    let reqId: string | null = null;
    let sessId: string | null = null;
    let tenantIdVal = 'default';
    let correlationIdVal = '';
    try {
      const headerList = await headers();
      reqId = headerList.get('x-request-id');
      sessId = headerList.get('x-session-id');
      tenantIdVal = headerList.get('x-tenant-id') || 'default';
      correlationIdVal = headerList.get('x-correlation-id') || '';
    } catch (e) {
      // outside request context
    }

    const remarks = params.remarks || `IP: ${params.ipAddress}, OS: ${os}`;
    const finalRemarks = correlationIdVal 
      ? `${remarks} (CorrelationId: ${correlationIdVal})`
      : remarks;

    await db.insert(systemAuditLogs).values({
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      tenantId: tenantIdVal,
      module: 'AUTH',
      entityName: 'users',
      entityId: params.userId || 'guest',
      action: params.action,
      performedBy: params.userId || 'guest',
      ipAddress: params.ipAddress || 'unknown',
      userAgent: params.userAgent || 'unknown',
      device,
      browser,
      remarks: finalRemarks,
      requestId: reqId,
      sessionId: sessId,
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

/**
 * Memperbarui lastActivity untuk sesi sliding session
 */
export async function updateSessionActivity(token: string) {
  try {
    await db
      .update(userSessions)
      .set({ lastActivity: new Date().toISOString() })
      .where(eq(userSessions.token, token));
  } catch (error) {
    console.error('Failed to update session activity:', error);
  }
}
