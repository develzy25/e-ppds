import { db } from '@/db';
import { masterBlock } from '../../schemas/master.schema';
import { eq, and, isNull, sql } from 'drizzle-orm';
import { CreateBlokInput, UpdateBlokInput } from '../validators/blok.validator';
import { BlokEntity } from '../types/blok.type';

export class BlokRepository {
  async findAll(pondokId: string): Promise<BlokEntity[]> {
    return db
      .select()
      .from(masterBlock)
      .where(and(eq(masterBlock.pondokId, pondokId), isNull(masterBlock.deletedAt)));
  }

  async findById(id: string, pondokId: string): Promise<BlokEntity | undefined> {
    const result = await db
      .select()
      .from(masterBlock)
      .where(and(eq(masterBlock.id, id), eq(masterBlock.pondokId, pondokId), isNull(masterBlock.deletedAt)))
      .limit(1);
    
    return result[0];
  }

  async findByName(name: string, pondokId: string): Promise<BlokEntity | undefined> {
    const result = await db
      .select()
      .from(masterBlock)
      .where(
        and(
          eq(masterBlock.name, name), 
          eq(masterBlock.pondokId, pondokId), 
          isNull(masterBlock.deletedAt)
        )
      )
      .limit(1);
    
    return result[0];
  }

  async create(data: CreateBlokInput & { id: string; createdBy: string }): Promise<BlokEntity> {
    const now = new Date().toISOString();
    
    const [created] = await db
      .insert(masterBlock)
      .values({
        id: data.id,
        name: data.name,
        pondokId: data.pondokId,
        createdAt: now,
        updatedAt: now,
        createdBy: data.createdBy,
        updatedBy: data.createdBy,
      })
      .returning();
      
    return created;
  }

  async update(id: string, data: UpdateBlokInput & { updatedBy: string }): Promise<BlokEntity> {
    const now = new Date().toISOString();
    
    const [updated] = await db
      .update(masterBlock)
      .set({
        name: data.name,
        updatedAt: now,
        updatedBy: data.updatedBy,
      })
      .where(and(eq(masterBlock.id, id), eq(masterBlock.pondokId, data.pondokId)))
      .returning();
      
    return updated;
  }

  async softDelete(id: string, pondokId: string, deletedBy: string): Promise<BlokEntity> {
    const now = new Date().toISOString();
    
    const [deleted] = await db
      .update(masterBlock)
      .set({
        deletedAt: now,
        deletedBy: deletedBy,
      })
      .where(and(eq(masterBlock.id, id), eq(masterBlock.pondokId, pondokId)))
      .returning();
      
    return deleted;
  }
}
