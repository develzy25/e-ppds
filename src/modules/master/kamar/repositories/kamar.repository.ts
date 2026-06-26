import { db } from '@/db';
import { masterRoom, masterBlock } from '../../schemas/master.schema';
import { eq, and, isNull } from 'drizzle-orm';
import { CreateKamarInput, UpdateKamarInput } from '../validators/kamar.validator';
import { KamarEntity } from '../types/kamar.type';

export class KamarRepository {
  async findAll(pondokId: string): Promise<KamarEntity[]> {
    const results = await db
      .select({
        kamar: masterRoom,
        blok: masterBlock,
      })
      .from(masterRoom)
      .leftJoin(masterBlock, eq(masterRoom.blockId, masterBlock.id))
      .where(and(eq(masterRoom.pondokId, pondokId), isNull(masterRoom.deletedAt)));

    return results.map(row => ({
      ...row.kamar,
      blok: row.blok || undefined,
    })) as KamarEntity[];
  }

  async findById(id: string, pondokId: string): Promise<KamarEntity | undefined> {
    const results = await db
      .select({
        kamar: masterRoom,
        blok: masterBlock,
      })
      .from(masterRoom)
      .leftJoin(masterBlock, eq(masterRoom.blockId, masterBlock.id))
      .where(and(eq(masterRoom.id, id), eq(masterRoom.pondokId, pondokId), isNull(masterRoom.deletedAt)))
      .limit(1);
    
    if (!results.length) return undefined;

    return {
      ...results[0].kamar,
      blok: results[0].blok || undefined,
    } as KamarEntity;
  }

  async findByNameAndBlock(name: string, blockId: string, pondokId: string): Promise<KamarEntity | undefined> {
    const result = await db
      .select()
      .from(masterRoom)
      .where(
        and(
          eq(masterRoom.name, name), 
          eq(masterRoom.blockId, blockId),
          eq(masterRoom.pondokId, pondokId), 
          isNull(masterRoom.deletedAt)
        )
      )
      .limit(1);
    
    return result[0] as KamarEntity;
  }

  async create(data: CreateKamarInput & { id: string; createdBy: string }): Promise<KamarEntity> {
    const now = new Date().toISOString();
    
    const [created] = await db
      .insert(masterRoom)
      .values({
        id: data.id,
        name: data.name,
        capacity: data.capacity,
        blockId: data.blockId,
        pondokId: data.pondokId,
        createdAt: now,
        updatedAt: now,
        createdBy: data.createdBy,
        updatedBy: data.createdBy,
      })
      .returning();
      
    return created as KamarEntity;
  }

  async update(id: string, data: UpdateKamarInput & { updatedBy: string }): Promise<KamarEntity> {
    const now = new Date().toISOString();
    
    const [updated] = await db
      .update(masterRoom)
      .set({
        name: data.name,
        capacity: data.capacity,
        blockId: data.blockId,
        updatedAt: now,
        updatedBy: data.updatedBy,
      })
      .where(and(eq(masterRoom.id, id), eq(masterRoom.pondokId, data.pondokId)))
      .returning();
      
    return updated as KamarEntity;
  }

  async softDelete(id: string, pondokId: string, deletedBy: string): Promise<KamarEntity> {
    const now = new Date().toISOString();
    
    const [deleted] = await db
      .update(masterRoom)
      .set({
        deletedAt: now,
        deletedBy: deletedBy,
      })
      .where(and(eq(masterRoom.id, id), eq(masterRoom.pondokId, pondokId)))
      .returning();
      
    return deleted as KamarEntity;
  }
}
