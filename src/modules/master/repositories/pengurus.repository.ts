import { db } from '@/db';
import { 
  masterPengurus, 
  pengurusRoles, 
  masterRole,
  pengurusPositions,
  masterPosition,
  masterPeriod,
  masterDepartment
} from '../schemas/master.schema';
import { eq, and, isNull } from 'drizzle-orm';
import { CreatePengurusInput, UpdatePengurusInput } from '../validators/pengurus.validator';
import { PengurusEntity, PengurusPosition } from '../types/pengurus.type';
import { RoleEntity } from '../types/role.type';
import { BaseRepository, DbClient } from '@/infrastructure/database/repositories/base.repository';

export class PengurusRepository extends BaseRepository<typeof masterPengurus> {
  constructor(dbClient?: DbClient) {
    super(masterPengurus, dbClient);
  }
  async findAll(pondokId: string): Promise<PengurusEntity[]> {
    const rawPengurus = await db
      .select()
      .from(masterPengurus)
      .where(and(eq(masterPengurus.pondokId, pondokId), isNull(masterPengurus.deletedAt)));

    const result: PengurusEntity[] = [];

    for (const p of rawPengurus) {
      const roles = await this.findRolesByPengurusId(p.id);
      const positions = await this.findPositionsByPengurusId(p.id);
      
      result.push({
        ...p,
        roles,
        positions,
      });
    }

    return result;
  }

  async findById(id: string, pondokId: string): Promise<PengurusEntity | undefined> {
    const rawPengurus = await db
      .select()
      .from(masterPengurus)
      .where(and(eq(masterPengurus.id, id), eq(masterPengurus.pondokId, pondokId), isNull(masterPengurus.deletedAt)))
      .limit(1);
    
    if (!rawPengurus.length) return undefined;

    const p = rawPengurus[0];
    const roles = await this.findRolesByPengurusId(p.id);
    const positions = await this.findPositionsByPengurusId(p.id);

    return {
      ...p,
      roles,
      positions,
    };
  }

  async findByEmail(email: string, pondokId: string): Promise<PengurusEntity | undefined> {
    const result = await db
      .select()
      .from(masterPengurus)
      .where(
        and(
          eq(masterPengurus.email, email), 
          eq(masterPengurus.pondokId, pondokId), 
          isNull(masterPengurus.deletedAt)
        )
      )
      .limit(1);
    
    return result[0] as PengurusEntity;
  }

  private async findRolesByPengurusId(pengurusId: string): Promise<RoleEntity[]> {
    const results = await db
      .select({
        role: masterRole
      })
      .from(pengurusRoles)
      .innerJoin(masterRole, eq(pengurusRoles.roleId, masterRole.id))
      .where(eq(pengurusRoles.pengurusId, pengurusId));

    return results.map(r => r.role) as RoleEntity[];
  }

  private async findPositionsByPengurusId(pengurusId: string): Promise<PengurusPosition[]> {
    const results = await db
      .select({
        pengurusPosition: pengurusPositions,
        jabatan: masterPosition,
        department: masterDepartment,
        periode: masterPeriod
      })
      .from(pengurusPositions)
      .innerJoin(masterPosition, eq(pengurusPositions.positionId, masterPosition.id))
      .innerJoin(masterDepartment, eq(masterPosition.departmentId, masterDepartment.id))
      .innerJoin(masterPeriod, eq(pengurusPositions.periodId, masterPeriod.id))
      .where(eq(pengurusPositions.pengurusId, pengurusId));

    return results.map(r => ({
      id: r.pengurusPosition.id,
      positionId: r.pengurusPosition.positionId,
      periodId: r.pengurusPosition.periodId,
      status: r.pengurusPosition.status,
      jabatan: {
        ...r.jabatan,
        department: r.department
      },
      periode: r.periode
    })) as PengurusPosition[];
  }

  async create(data: CreatePengurusInput & { id: string; passwordHash: string; createdBy: string }): Promise<PengurusEntity> {
    const now = new Date().toISOString();
    
    return await this.database.transaction(async (tx: any) => {
      const [created] = await tx
        .insert(masterPengurus)
        .values({
          id: data.id,
          name: data.name,
          email: data.email,
          passwordHash: data.passwordHash,
          statusAktif: data.statusAktif,
          pondokId: data.pondokId,
          createdAt: now,
          updatedAt: now,
          createdBy: data.createdBy,
          updatedBy: data.createdBy,
        })
        .returning();

      // Insert roles
      if (data.roleIds && data.roleIds.length > 0) {
        await tx.insert(pengurusRoles).values(
          data.roleIds.map((roleId: string, index: number) => ({
            id: `${data.id}-role-${index}`,
            pengurusId: data.id,
            roleId
          }))
        );
      }

      // Insert positions
      if (data.positions && data.positions.length > 0) {
        await tx.insert(pengurusPositions).values(
          data.positions.map((pos: any, index: number) => ({
            id: `${data.id}-pos-${index}`,
            pengurusId: data.id,
            positionId: pos.positionId,
            periodId: pos.periodId,
            status: 'Aktif'
          }))
        );
      }
        
      return created as PengurusEntity;
    });
  }

  async update(id: string, data: UpdatePengurusInput & { passwordHash?: string; updatedBy: string }): Promise<PengurusEntity> {
    const now = new Date().toISOString();
    
    return await this.database.transaction(async (tx: any) => {
      const updateData: any = {
        name: data.name,
        email: data.email,
        statusAktif: data.statusAktif,
        updatedAt: now,
        updatedBy: data.updatedBy,
      };

      if (data.passwordHash) {
        updateData.passwordHash = data.passwordHash;
      }

      const [updated] = await tx
        .update(masterPengurus)
        .set(updateData)
        .where(and(eq(masterPengurus.id, id), eq(masterPengurus.pondokId, data.pondokId)))
        .returning();

      // Update roles: delete old, insert new
      await tx.delete(pengurusRoles).where(eq(pengurusRoles.pengurusId, id));
      if (data.roleIds && data.roleIds.length > 0) {
        await tx.insert(pengurusRoles).values(
          data.roleIds.map((roleId, index) => ({
            id: `${id}-role-${index}-${Date.now()}`,
            pengurusId: id,
            roleId
          }))
        );
      }

      // Update positions: delete old, insert new
      // In a real scenario you might want to preserve status or just logically delete,
      // but for simplicity we replace them
      await tx.delete(pengurusPositions).where(eq(pengurusPositions.pengurusId, id));
      if (data.positions && data.positions.length > 0) {
        await tx.insert(pengurusPositions).values(
          data.positions.map((pos, index) => ({
            id: `${id}-pos-${index}-${Date.now()}`,
            pengurusId: id,
            positionId: pos.positionId,
            periodId: pos.periodId,
            status: 'Aktif'
          }))
        );
      }
        
      return updated as PengurusEntity;
    });
  }

  async softDelete(id: string, pondokId: string, deletedBy: string): Promise<PengurusEntity> {
    const now = new Date().toISOString();
    
    const [deleted] = await db
      .update(masterPengurus)
      .set({
        deletedAt: now,
        deletedBy: deletedBy,
      })
      .where(and(eq(masterPengurus.id, id), eq(masterPengurus.pondokId, pondokId)))
      .returning();
      
    return deleted as PengurusEntity;
  }
}
