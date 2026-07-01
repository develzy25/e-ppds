import { db } from '@/db';
import { DbClient } from '@/infrastructure/database/repositories/base.repository';
import { masterPermission } from '../schemas/master.schema';
import { eq, and, isNull, sql } from 'drizzle-orm';
import { CreatePermissionInput, UpdatePermissionInput } from '../validators/permission.validator';
import { PermissionEntity } from '../types/permission.type';

export class PermissionRepository {
  constructor(protected readonly database: DbClient = db) {}
  async findAll(pondokId: string): Promise<PermissionEntity[]> {
    return db
      .select()
      .from(masterPermission)
      .where(and(eq(masterPermission.pondokId, pondokId), isNull(masterPermission.deletedAt)));
  }

  async findById(id: string, pondokId: string): Promise<PermissionEntity | undefined> {
    const result = await db
      .select()
      .from(masterPermission)
      .where(and(eq(masterPermission.id, id), eq(masterPermission.pondokId, pondokId), isNull(masterPermission.deletedAt)))
      .limit(1);
    
    return result[0];
  }

  async findByName(name: string, pondokId: string): Promise<PermissionEntity | undefined> {
    const result = await db
      .select()
      .from(masterPermission)
      .where(and(eq(masterPermission.name, name), eq(masterPermission.pondokId, pondokId), isNull(masterPermission.deletedAt)))
      .limit(1);
    
    return result[0];
  }

  async create(data: CreatePermissionInput & { id: string; createdBy: string }): Promise<PermissionEntity> {
    const now = new Date().toISOString();
    
    const [created] = await db
      .insert(masterPermission)
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

  async update(id: string, data: UpdatePermissionInput & { updatedBy: string }): Promise<PermissionEntity> {
    const now = new Date().toISOString();
    
    const [updated] = await db
      .update(masterPermission)
      .set({
        name: data.name,
        description: data.description || null,
        updatedAt: now,
        updatedBy: data.updatedBy,
      })
      .where(and(eq(masterPermission.id, id), eq(masterPermission.pondokId, data.pondokId)))
      .returning();
      
    return updated;
  }

  async softDelete(id: string, pondokId: string, deletedBy: string): Promise<PermissionEntity> {
    const now = new Date().toISOString();
    
    const [deleted] = await db
      .update(masterPermission)
      .set({
        deletedAt: now,
        deletedBy: deletedBy,
      })
      .where(and(eq(masterPermission.id, id), eq(masterPermission.pondokId, pondokId)))
      .returning();
      
    return deleted;
  }
}
