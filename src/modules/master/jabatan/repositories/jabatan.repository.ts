import { db } from '@/db';
import { masterPosition, masterDepartment } from '../../schemas/master.schema';
import { eq, and, isNull } from 'drizzle-orm';
import { CreateJabatanInput, UpdateJabatanInput } from '../validators/jabatan.validator';
import { JabatanEntity } from '../types/jabatan.type';

export class JabatanRepository {
  async findAll(pondokId: string): Promise<JabatanEntity[]> {
    const results = await db
      .select({
        jabatan: masterPosition,
        department: masterDepartment,
      })
      .from(masterPosition)
      .leftJoin(masterDepartment, eq(masterPosition.departmentId, masterDepartment.id))
      .where(and(eq(masterPosition.pondokId, pondokId), isNull(masterPosition.deletedAt)));

    return results.map(row => ({
      ...row.jabatan,
      department: row.department || undefined,
    })) as JabatanEntity[];
  }

  async findById(id: string, pondokId: string): Promise<JabatanEntity | undefined> {
    const results = await db
      .select({
        jabatan: masterPosition,
        department: masterDepartment,
      })
      .from(masterPosition)
      .leftJoin(masterDepartment, eq(masterPosition.departmentId, masterDepartment.id))
      .where(and(eq(masterPosition.id, id), eq(masterPosition.pondokId, pondokId), isNull(masterPosition.deletedAt)))
      .limit(1);
    
    if (!results.length) return undefined;

    return {
      ...results[0].jabatan,
      department: results[0].department || undefined,
    } as JabatanEntity;
  }

  async findByNameAndDepartment(name: string, departmentId: string, pondokId: string): Promise<JabatanEntity | undefined> {
    const result = await db
      .select()
      .from(masterPosition)
      .where(
        and(
          eq(masterPosition.name, name), 
          eq(masterPosition.departmentId, departmentId),
          eq(masterPosition.pondokId, pondokId), 
          isNull(masterPosition.deletedAt)
        )
      )
      .limit(1);
    
    return result[0] as JabatanEntity;
  }

  async create(data: CreateJabatanInput & { id: string; createdBy: string }): Promise<JabatanEntity> {
    const now = new Date().toISOString();
    
    const [created] = await db
      .insert(masterPosition)
      .values({
        id: data.id,
        name: data.name,
        departmentId: data.departmentId,
        pondokId: data.pondokId,
        createdAt: now,
        updatedAt: now,
        createdBy: data.createdBy,
        updatedBy: data.createdBy,
      })
      .returning();
      
    return created as JabatanEntity;
  }

  async update(id: string, data: UpdateJabatanInput & { updatedBy: string }): Promise<JabatanEntity> {
    const now = new Date().toISOString();
    
    const [updated] = await db
      .update(masterPosition)
      .set({
        name: data.name,
        departmentId: data.departmentId,
        updatedAt: now,
        updatedBy: data.updatedBy,
      })
      .where(and(eq(masterPosition.id, id), eq(masterPosition.pondokId, data.pondokId)))
      .returning();
      
    return updated as JabatanEntity;
  }

  async softDelete(id: string, pondokId: string, deletedBy: string): Promise<JabatanEntity> {
    const now = new Date().toISOString();
    
    const [deleted] = await db
      .update(masterPosition)
      .set({
        deletedAt: now,
        deletedBy: deletedBy,
      })
      .where(and(eq(masterPosition.id, id), eq(masterPosition.pondokId, pondokId)))
      .returning();
      
    return deleted as JabatanEntity;
  }
}
