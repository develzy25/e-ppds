import { db } from '@/db';
import { masterClass, masterSchool } from '../../schemas/master.schema';
import { eq, and, isNull } from 'drizzle-orm';
import { CreateKelasInput, UpdateKelasInput } from '../validators/kelas.validator';
import { KelasEntity } from '../types/kelas.type';

export class KelasRepository {
  async findAll(pondokId: string): Promise<KelasEntity[]> {
    const results = await db
      .select({
        kelas: masterClass,
        sekolah: masterSchool,
      })
      .from(masterClass)
      .leftJoin(masterSchool, eq(masterClass.schoolId, masterSchool.id))
      .where(and(eq(masterClass.pondokId, pondokId), isNull(masterClass.deletedAt)));

    return results.map(row => ({
      ...row.kelas,
      sekolah: row.sekolah || undefined,
    })) as KelasEntity[];
  }

  async findById(id: string, pondokId: string): Promise<KelasEntity | undefined> {
    const results = await db
      .select({
        kelas: masterClass,
        sekolah: masterSchool,
      })
      .from(masterClass)
      .leftJoin(masterSchool, eq(masterClass.schoolId, masterSchool.id))
      .where(and(eq(masterClass.id, id), eq(masterClass.pondokId, pondokId), isNull(masterClass.deletedAt)))
      .limit(1);
    
    if (!results.length) return undefined;

    return {
      ...results[0].kelas,
      sekolah: results[0].sekolah || undefined,
    } as KelasEntity;
  }

  async findByNameAndSchool(name: string, schoolId: string, pondokId: string): Promise<KelasEntity | undefined> {
    const result = await db
      .select()
      .from(masterClass)
      .where(
        and(
          eq(masterClass.name, name), 
          eq(masterClass.schoolId, schoolId),
          eq(masterClass.pondokId, pondokId), 
          isNull(masterClass.deletedAt)
        )
      )
      .limit(1);
    
    return result[0] as KelasEntity;
  }

  async create(data: CreateKelasInput & { id: string; createdBy: string }): Promise<KelasEntity> {
    const now = new Date().toISOString();
    
    const [created] = await db
      .insert(masterClass)
      .values({
        id: data.id,
        name: data.name,
        schoolId: data.schoolId,
        pondokId: data.pondokId,
        createdAt: now,
        updatedAt: now,
        createdBy: data.createdBy,
        updatedBy: data.createdBy,
      })
      .returning();
      
    return created as KelasEntity;
  }

  async update(id: string, data: UpdateKelasInput & { updatedBy: string }): Promise<KelasEntity> {
    const now = new Date().toISOString();
    
    const [updated] = await db
      .update(masterClass)
      .set({
        name: data.name,
        schoolId: data.schoolId,
        updatedAt: now,
        updatedBy: data.updatedBy,
      })
      .where(and(eq(masterClass.id, id), eq(masterClass.pondokId, data.pondokId)))
      .returning();
      
    return updated as KelasEntity;
  }

  async softDelete(id: string, pondokId: string, deletedBy: string): Promise<KelasEntity> {
    const now = new Date().toISOString();
    
    const [deleted] = await db
      .update(masterClass)
      .set({
        deletedAt: now,
        deletedBy: deletedBy,
      })
      .where(and(eq(masterClass.id, id), eq(masterClass.pondokId, pondokId)))
      .returning();
      
    return deleted as KelasEntity;
  }
}
