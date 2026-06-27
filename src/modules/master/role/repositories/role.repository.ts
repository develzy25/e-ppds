import { db } from '@/db';
import { DbClient } from '@/infrastructure/database/repositories/base.repository';
import { masterRole } from '../../schemas/master.schema';
import { eq, and, isNull, sql } from 'drizzle-orm';
import { CreateRoleInput, UpdateRoleInput } from '../validators/role.validator';
import { RoleEntity } from '../types/role.type';

export class RoleRepository {
  constructor(protected readonly database: DbClient = db) {}
  async findAll(pondokId: string): Promise<RoleEntity[]> {
    return db
      .select()
      .from(masterRole)
      .where(and(eq(masterRole.pondokId, pondokId), isNull(masterRole.deletedAt)));
  }

  async findById(id: string, pondokId: string): Promise<RoleEntity | undefined> {
    const result = await db
      .select()
      .from(masterRole)
      .where(and(eq(masterRole.id, id), eq(masterRole.pondokId, pondokId), isNull(masterRole.deletedAt)))
      .limit(1);
    
    return result[0];
  }

  async findByName(name: string, pondokId: string): Promise<RoleEntity | undefined> {
    const result = await db
      .select()
      .from(masterRole)
      .where(and(eq(masterRole.name, name), eq(masterRole.pondokId, pondokId), isNull(masterRole.deletedAt)))
      .limit(1);
    
    return result[0];
  }

  async create(data: CreateRoleInput & { id: string; createdBy: string }): Promise<RoleEntity> {
    const now = new Date().toISOString();
    
    const [created] = await db
      .insert(masterRole)
      .values({
        id: data.id,
        name: data.name,
        description: data.description || null,
        pondokId: data.pondokId,
        createdAt: now,
        updatedAt: now,
        createdBy: data.createdBy,
        updatedBy: data.createdBy,
      })
      .returning();
      
    return created;
  }

  async update(id: string, data: UpdateRoleInput & { updatedBy: string }): Promise<RoleEntity> {
    const now = new Date().toISOString();
    
    const [updated] = await db
      .update(masterRole)
      .set({
        name: data.name,
        description: data.description || null,
        updatedAt: now,
        updatedBy: data.updatedBy,
      })
      .where(and(eq(masterRole.id, id), eq(masterRole.pondokId, data.pondokId)))
      .returning();
      
    return updated;
  }

  async softDelete(id: string, pondokId: string, deletedBy: string): Promise<RoleEntity> {
    const now = new Date().toISOString();
    
    const [deleted] = await db
      .update(masterRole)
      .set({
        deletedAt: now,
        deletedBy: deletedBy,
      })
      .where(and(eq(masterRole.id, id), eq(masterRole.pondokId, pondokId)))
      .returning();
      
    return deleted;
  }
}
