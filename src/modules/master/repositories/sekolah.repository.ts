import { db } from '@/db';
import { DbClient } from '@/infrastructure/database/repositories/base.repository';
import { masterSchool } from '../schemas/master.schema';
import { eq, and, isNull } from 'drizzle-orm';
import { CreateSekolahInput, UpdateSekolahInput } from '../validators/sekolah.validator';
import { SekolahEntity } from '../types/sekolah.type';

export class SekolahRepository {
  constructor(protected readonly database: DbClient = db) {}
  async findAll(pondokId: string): Promise<SekolahEntity[]> {
    return db
      .select()
      .from(masterSchool)
      .where(and(eq(masterSchool.pondokId, pondokId), isNull(masterSchool.deletedAt)));
  }

  async findById(id: string, pondokId: string): Promise<SekolahEntity | undefined> {
    const result = await db
      .select()
      .from(masterSchool)
      .where(and(eq(masterSchool.id, id), eq(masterSchool.pondokId, pondokId), isNull(masterSchool.deletedAt)))
      .limit(1);
    
    return result[0];
  }

  async findByNameAndType(name: string, type: string, pondokId: string): Promise<SekolahEntity | undefined> {
    const result = await db
      .select()
      .from(masterSchool)
      .where(
        and(
          eq(masterSchool.name, name), 
          eq(masterSchool.type, type),
          eq(masterSchool.pondokId, pondokId), 
          isNull(masterSchool.deletedAt)
        )
      )
      .limit(1);
    
    return result[0];
  }

  async create(data: CreateSekolahInput & { id: string; createdBy: string }): Promise<SekolahEntity> {
    const now = new Date().toISOString();
    
    const [created] = await db
      .insert(masterSchool)
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

  async update(id: string, data: UpdateSekolahInput & { updatedBy: string }): Promise<SekolahEntity> {
    const now = new Date().toISOString();
    
    const [updated] = await db
      .update(masterSchool)
      .set({
        name: data.name,
        type: data.type,
        updatedAt: now,
        updatedBy: data.updatedBy,
      })
      .where(and(eq(masterSchool.id, id), eq(masterSchool.pondokId, data.pondokId)))
      .returning();
      
    return updated;
  }

  async softDelete(id: string, pondokId: string, deletedBy: string): Promise<SekolahEntity> {
    const now = new Date().toISOString();
    
    const [deleted] = await db
      .update(masterSchool)
      .set({
        deletedAt: now,
        deletedBy: deletedBy,
      })
      .where(and(eq(masterSchool.id, id), eq(masterSchool.pondokId, pondokId)))
      .returning();
      
    return deleted;
  }
}
