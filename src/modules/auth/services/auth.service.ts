import { AuthRepository } from '../repositories/auth.repository';
import { UserSessionData } from '../types/auth.types';
import { signJwt } from '../jwt';
import crypto from 'crypto';

export class AuthService {
  constructor(private readonly repo: AuthRepository) {}

  hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  async loginUser(email: string, passwordHash: string, pondokId: string, userAgent: string, ipAddress: string): Promise<string | null> {
    const user = await this.repo.findUserByEmailAndTenant(email, pondokId);
    if (!user || user.passwordHash !== passwordHash) return null;

    const periodId = await this.repo.getActivePeriod(pondokId);
    const activeRoles = await this.repo.getUserRoles(user.id, periodId);
    
    const roles = activeRoles.map((r: any) => r.roleName) as string[];
    const roleIds = activeRoles.map((r: any) => r.roleId) as string[];
    
    const permissionsData = await this.repo.getRolePermissions(roleIds);
    const permissions = Array.from(new Set(permissionsData.map((p: any) => p.permissionName))) as string[];

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const payload: UserSessionData & import('@/shared/utils/jwt').JwtPayload = {
      userId: user.id,
      name: user.name,
      email: user.email,
      roles,
      permissions,
      pondokId,
      periodId,
      sessionVersion: user.sessionVersion,
      permissionVersion: user.permissionVersion,
    };

    const token = await signJwt(payload);

    await this.repo.saveSession({
      id: `sess-${crypto.randomBytes(8).toString('hex')}`,
      userId: user.id,
      token,
      userAgent,
      ipAddress,
      expiresAt,
      createdAt: new Date().toISOString(),
    });

    return token;
  }

  async logoutUser(token: string): Promise<void> {
    await this.repo.deleteSession(token);
  }
}

export const authService = new AuthService(new AuthRepository());

export function hashPassword(password: string): string {
  return authService.hashPassword(password);
}

export async function loginUser(email: string, passwordHash: string, pondokId: string, userAgent: string = 'Unknown', ipAddress: string = '127.0.0.1'): Promise<string | null> {
  return authService.loginUser(email, passwordHash, pondokId, userAgent, ipAddress);
}

export async function logoutUser(token: string): Promise<void> {
  return authService.logoutUser(token);
}
