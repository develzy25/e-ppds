import { ForbiddenError } from '@/infrastructure/errors';
import { requireAuth } from '../session/session.service';

export async function requirePermission(permission: string): Promise<boolean> {
  const session = await requireAuth();
  if (!session.permissions.includes(permission)) {
    throw new ForbiddenError(`Forbidden: requires ${permission}`);
  }
  return true;
}

export async function requireRole(role: string): Promise<boolean> {
  const session = await requireAuth();
  if (!session.roles.includes(role)) {
    throw new ForbiddenError(`Forbidden: requires role ${role}`);
  }
  return true;
}
