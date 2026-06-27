import { db } from '@/db';
import { DbClient } from '@/infrastructure/database/repositories/base.repository';
import { masterDepartment } from '../../schemas/master.schema';
import { eq, and, isNull } from 'drizzle-orm';
import { CreateDepartmentInput, UpdateDepartmentInput } from '../validators/department.validator';
import { DepartmentEntity } from '../types/department.type';

export class DepartmentRepository {
  constructor(protected readonly database: DbClient = db) {}
  async findAll(pondokId: string): Promise<DepartmentEntity[]> {
    return db
      .select()
      .from(masterDepartment)
      .where(and(eq(masterDepartment.pondokId, pondokId), isNull(masterDepartment.deletedAt)));
  }

  async findById(id: string, pondokId: string): Promise<DepartmentEntity | undefined> {
    const result = await db
      .select()
      .from(masterDepartment)
      .where(and(eq(masterDepartment.id, id), eq(masterDepartment.pondokId, pondokId), isNull(masterDepartment.deletedAt)))
      .limit(1);
    
    return result[0];
  }

  async findByName(name: string, pondokId: string): Promise<DepartmentEntity | undefined> {
    const result = await db
      .select()
      .from(masterDepartment)
      .where(and(eq(masterDepartment.name, name), eq(masterDepartment.pondokId, pondokId), isNull(masterDepartment.deletedAt)))
      .limit(1);
    
    return result[0];
  }

  async create(data: CreateDepartmentInput & { id: string; createdBy: string }): Promise<DepartmentEntity> {
    const now = new Date().toISOString();
    
    const [created] = await db
      .insert(masterDepartment)
      .values({
        id: data.id,
        name: data.name,
        type: data.type,
        pondokId: data.pondokId,
        createdAt: now,
        updatedAt: now,
        createdBy: data.createdBy,
        updatedBy: data.createdBy,
      })
      .returning();
      
    return created;
  }

  async update(id: string, data: UpdateDepartmentInput & { updatedBy: string }): Promise<DepartmentEntity> {
    const now = new Date().toISOString();
    
    const [updated] = await db
      .update(masterDepartment)
      .set({
        name: data.name,
        type: data.type,
        updatedAt: now,
        updatedBy: data.updatedBy,
      })
      .where(and(eq(masterDepartment.id, id), eq(masterDepartment.pondokId, data.pondokId)))
      .returning();
      
    return updated;
  }

  async softDelete(id: string, pondokId: string, deletedBy: string): Promise<DepartmentEntity> {
    const now = new Date().toISOString();
    
    const [deleted] = await db
      .update(masterDepartment)
      .set({
        deletedAt: now,
        deletedBy: deletedBy,
      })
      .where(and(eq(masterDepartment.id, id), eq(masterDepartment.pondokId, pondokId)))
      .returning();
      
    return deleted;
  }
}
