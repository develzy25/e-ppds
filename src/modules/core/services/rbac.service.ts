import { ForbiddenError } from '@/infrastructure/errors/forbidden.error';

/**
 * Memeriksa apakah user saat ini memiliki permission yang dibutuhkan.
 * Jika tidak, akan melempar ForbiddenError yang nantinya ditangkap oleh Server Action.
 * 
 * @param userPermissions - Array permission string milik user saat ini (contoh: ['master.santri.create'])
 * @param requiredPermission - Permission yang dibutuhkan (contoh: 'master.santri.create')
 */
export function requirePermission(userPermissions: string[], requiredPermission: string) {
  if (!userPermissions.includes(requiredPermission)) {
    throw new ForbiddenError(`Akses ditolak: Membutuhkan izin '${requiredPermission}'`);
  }
}

/**
 * Memeriksa apakah user memiliki salah satu dari permission yang ada (OR logic)
 */
export function requireAnyPermission(userPermissions: string[], requiredPermissions: string[]) {
  const hasPermission = requiredPermissions.some(p => userPermissions.includes(p));
  if (!hasPermission) {
    throw new ForbiddenError(`Akses ditolak: Membutuhkan setidaknya salah satu izin: ${requiredPermissions.join(', ')}`);
  }
}
