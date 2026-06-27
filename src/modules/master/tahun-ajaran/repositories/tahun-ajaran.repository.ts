import { db } from '@/db';
import { DbClient } from '@/infrastructure/database/repositories/base.repository';
import { masterAcademicYear } from '../../schemas/master.schema';
import { eq, and, isNull } from 'drizzle-orm';
import { CreateTahunAjaranInput, UpdateTahunAjaranInput } from '../validators/tahun-ajaran.validator';
import { TahunAjaranEntity } from '../types/tahun-ajaran.type';

export class TahunAjaranRepository {
  constructor(protected readonly database: DbClient = db) {}
  async findAll(pondokId: string): Promise<TahunAjaranEntity[]> {
    return db
      .select()
      .from(masterAcademicYear)
      .where(and(eq(masterAcademicYear.pondokId, pondokId), isNull(masterAcademicYear.deletedAt)));
  }

  async findById(id: string, pondokId: string): Promise<TahunAjaranEntity | undefined> {
    const result = await db
      .select()
      .from(masterAcademicYear)
      .where(and(eq(masterAcademicYear.id, id), eq(masterAcademicYear.pondokId, pondokId), isNull(masterAcademicYear.deletedAt)))
      .limit(1);
    
    return result[0];
  }

  async findByName(name: string, pondokId: string): Promise<TahunAjaranEntity | undefined> {
    const result = await db
      .select()
      .from(masterAcademicYear)
      .where(and(eq(masterAcademicYear.name, name), eq(masterAcademicYear.pondokId, pondokId), isNull(masterAcademicYear.deletedAt)))
      .limit(1);
    
    return result[0];
  }

  async create(data: CreateTahunAjaranInput & { id: string; createdBy: string }): Promise<TahunAjaranEntity> {
    const now = new Date().toISOString();
    
    const [created] = await db
      .insert(masterAcademicYear)
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

  async update(id: string, data: UpdateTahunAjaranInput & { updatedBy: string }): Promise<TahunAjaranEntity> {
    const now = new Date().toISOString();
    
    const [updated] = await db
      .update(masterAcademicYear)
      .set({
        name: data.name,
        status: data.status,
        updatedAt: now,
        updatedBy: data.updatedBy,
      })
      .where(and(eq(masterAcademicYear.id, id), eq(masterAcademicYear.pondokId, data.pondokId)))
      .returning();
      
    return updated;
  }

  async softDelete(id: string, pondokId: string, deletedBy: string): Promise<TahunAjaranEntity> {
    const now = new Date().toISOString();
    
    const [deleted] = await db
      .update(masterAcademicYear)
      .set({
        deletedAt: now,
        deletedBy: deletedBy,
      })
      .where(and(eq(masterAcademicYear.id, id), eq(masterAcademicYear.pondokId, pondokId)))
      .returning();
      
    return deleted;
  }
}
