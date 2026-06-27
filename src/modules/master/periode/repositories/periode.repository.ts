import { db } from '@/db';
import { DbClient } from '@/infrastructure/database/repositories/base.repository';
import { masterPeriod } from '../../schemas/master.schema';
import { eq, and, isNull, sql } from 'drizzle-orm';
import { CreatePeriodeInput, UpdatePeriodeInput } from '../validators/periode.validator';
import { PeriodeEntity } from '../types/periode.type';

export class PeriodeRepository {
  constructor(protected readonly database: DbClient = db) {}
  async findAll(pondokId: string): Promise<PeriodeEntity[]> {
    return db
      .select()
      .from(masterPeriod)
      .where(and(eq(masterPeriod.pondokId, pondokId), isNull(masterPeriod.deletedAt)));
  }

  async findById(id: string, pondokId: string): Promise<PeriodeEntity | undefined> {
    const result = await db
      .select()
      .from(masterPeriod)
      .where(and(eq(masterPeriod.id, id), eq(masterPeriod.pondokId, pondokId), isNull(masterPeriod.deletedAt)))
      .limit(1);
    
    return result[0];
  }

  async findByName(name: string, pondokId: string): Promise<PeriodeEntity | undefined> {
    const result = await db
      .select()
      .from(masterPeriod)
      .where(and(eq(masterPeriod.name, name), eq(masterPeriod.pondokId, pondokId), isNull(masterPeriod.deletedAt)))
      .limit(1);
    
    return result[0];
  }

  async create(data: CreatePeriodeInput & { id: string; createdBy: string }): Promise<PeriodeEntity> {
    const now = new Date().toISOString();
    
    const [created] = await db
      .insert(masterPeriod)
      .values({
        id: data.id,
        name: data.name,
        status: data.status,
        pondokId: data.pondokId,
        createdAt: now,
        updatedAt: now,
        createdBy: data.createdBy,
        updatedBy: data.createdBy,
      })
      .returning();
      
    return created;
  }

  async update(id: string, data: UpdatePeriodeInput & { updatedBy: string }): Promise<PeriodeEntity> {
    const now = new Date().toISOString();
    
    const [updated] = await db
      .update(masterPeriod)
      .set({
        name: data.name,
        status: data.status,
        updatedAt: now,
        updatedBy: data.updatedBy,
      })
      .where(and(eq(masterPeriod.id, id), eq(masterPeriod.pondokId, data.pondokId)))
      .returning();
      
    return updated;
  }

  async softDelete(id: string, pondokId: string, deletedBy: string): Promise<PeriodeEntity> {
    const now = new Date().toISOString();
    
    const [deleted] = await db
      .update(masterPeriod)
      .set({
        deletedAt: now,
        deletedBy: deletedBy,
      })
      .where(and(eq(masterPeriod.id, id), eq(masterPeriod.pondokId, pondokId)))
      .returning();
      
    return deleted;
  }
}
