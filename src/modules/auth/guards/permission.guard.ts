import { requireAuth } from '../session/session.service';

export async function requirePermission(permission: string): Promise<boolean> {
  const session = await requireAuth();
  if (!session.permissions.includes(permission)) {
    throw new Error(`Forbidden: requires ${permission}`);
  }
  return true;
}

export async function requireRole(role: string): Promise<boolean> {
  const session = await requireAuth();
  if (!session.roles.includes(role)) {
    throw new Error(`Forbidden: requires role ${role}`);
  }
  return true;
}
