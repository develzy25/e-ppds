import { BaseRepository, DbClient } from '@/infrastructure/database/repositories/base.repository';
import { users, periodes, masterRoles, userRoles, rolePermissions, masterPermissions, userSessions } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

export class AuthRepository extends BaseRepository<typeof users> {
  constructor(dbClient?: DbClient) {
    super(users, dbClient);
  }

  async findUserByEmailAndTenant(email: string, pondokId: string) {
    const foundUsers = await this.database
      .select()
      .from(users)
      .where(and(eq(users.email, email), eq(users.pondokId, pondokId)));
    return foundUsers[0] || null;
  }

  async getActivePeriod(pondokId: string) {
    const activePeriods = await this.database
      .select()
      .from(periodes)
      .where(and(eq(periodes.pondokId, pondokId), eq(periodes.status, 'Aktif')));
    return activePeriods.length > 0 ? activePeriods[0].id : 'default-period';
  }

  async getUserRoles(userId: string, periodId: string) {
    return await this.database
      .select({ roleId: masterRoles.id, roleName: masterRoles.name })
      .from(userRoles)
      .innerJoin(masterRoles, eq(userRoles.roleId, masterRoles.id))
      .where(and(eq(userRoles.userId, userId), eq(userRoles.periodId, periodId), eq(userRoles.status, 'Aktif')));
  }

  async getRolePermissions(roleIds: string[]) {
    if (roleIds.length === 0) return [];
    return await this.database
      .select({ permissionName: masterPermissions.name })
      .from(rolePermissions)
      .innerJoin(masterPermissions, eq(rolePermissions.permissionId, masterPermissions.id))
      .where(inArray(rolePermissions.roleId, roleIds));
  }

  async saveSession(sessionData: typeof userSessions.$inferInsert) {
    await this.database.insert(userSessions).values(sessionData);
  }

  async deleteSession(token: string) {
    await this.database.delete(userSessions).where(eq(userSessions.token, token));
  }
}
