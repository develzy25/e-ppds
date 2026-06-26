import { db } from '@/db';
import { 
  masterSantri,
  masterRoom,
  masterClass,
  masterAcademicYear
} from '../../schemas/master.schema';
import { eq, and, isNull } from 'drizzle-orm';
import { CreateSantriInput, UpdateSantriInput } from '../validators/santri.validator';
import { SantriEntity } from '../types/santri.type';
import { alias } from 'drizzle-orm/sqlite-core';

export class SantriRepository {
  async findAll(pondokId: string): Promise<SantriEntity[]> {
    const classFormal = alias(masterClass, 'classFormal');
    const classDiniyah = alias(masterClass, 'classDiniyah');

    const results = await db
      .select({
        santri: masterSantri,
        kamar: masterRoom,
        formal: classFormal,
        diniyah: classDiniyah,
        academicYear: masterAcademicYear
      })
      .from(masterSantri)
      .leftJoin(masterRoom, eq(masterSantri.roomId, masterRoom.id))
      .leftJoin(classFormal, eq(masterSantri.classFormalId, classFormal.id))
      .leftJoin(classDiniyah, eq(masterSantri.classDiniyahId, classDiniyah.id))
      .leftJoin(masterAcademicYear, eq(masterSantri.academicYearId, masterAcademicYear.id))
      .where(and(eq(masterSantri.pondokId, pondokId), isNull(masterSantri.deletedAt)));

    return results.map(row => ({
      ...row.santri,
      kamar: row.kamar || undefined,
      classFormal: row.formal || undefined,
      classDiniyah: row.diniyah || undefined,
      academicYear: row.academicYear || undefined,
    })) as SantriEntity[];
  }

  async findById(id: string, pondokId: string): Promise<SantriEntity | undefined> {
    const classFormal = alias(masterClass, 'classFormal');
    const classDiniyah = alias(masterClass, 'classDiniyah');

    const results = await db
      .select({
        santri: masterSantri,
        kamar: masterRoom,
        formal: classFormal,
        diniyah: classDiniyah,
        academicYear: masterAcademicYear
      })
      .from(masterSantri)
      .leftJoin(masterRoom, eq(masterSantri.roomId, masterRoom.id))
      .leftJoin(classFormal, eq(masterSantri.classFormalId, classFormal.id))
      .leftJoin(classDiniyah, eq(masterSantri.classDiniyahId, classDiniyah.id))
      .leftJoin(masterAcademicYear, eq(masterSantri.academicYearId, masterAcademicYear.id))
      .where(and(eq(masterSantri.id, id), eq(masterSantri.pondokId, pondokId), isNull(masterSantri.deletedAt)))
      .limit(1);
    
    if (!results.length) return undefined;

    return {
      ...results[0].santri,
      kamar: results[0].kamar || undefined,
      classFormal: results[0].formal || undefined,
      classDiniyah: results[0].diniyah || undefined,
      academicYear: results[0].academicYear || undefined,
    } as SantriEntity;
  }

  async findByNis(nis: string, pondokId: string): Promise<SantriEntity | undefined> {
    const result = await db
      .select()
      .from(masterSantri)
      .where(
        and(
          eq(masterSantri.nis, nis), 
          eq(masterSantri.pondokId, pondokId), 
          isNull(masterSantri.deletedAt)
        )
      )
      .limit(1);
    
    return result[0] as SantriEntity;
  }

  async create(data: CreateSantriInput & { id: string; createdBy: string }): Promise<SantriEntity> {
    const now = new Date().toISOString();
    
    const [created] = await db
      .insert(masterSantri)
      .values({
        id: data.id,
        nis: data.nis,
        name: data.name,
        gender: data.gender,
        statusAktif: data.statusAktif,
        roomId: data.roomId || null,
        classFormalId: data.classFormalId || null,
        classDiniyahId: data.classDiniyahId || null,
        academicYearId: data.academicYearId,
        pondokId: data.pondokId,
        createdAt: now,
        updatedAt: now,
        createdBy: data.createdBy,
        updatedBy: data.createdBy,
      })
      .returning();
      
    return created as SantriEntity;
  }

  async update(id: string, data: UpdateSantriInput & { updatedBy: string }): Promise<SantriEntity> {
    const now = new Date().toISOString();
    
    const [updated] = await db
      .update(masterSantri)
      .set({
        nis: data.nis,
        name: data.name,
        gender: data.gender,
        statusAktif: data.statusAktif,
        roomId: data.roomId || null,
        classFormalId: data.classFormalId || null,
        classDiniyahId: data.classDiniyahId || null,
        academicYearId: data.academicYearId,
        updatedAt: now,
        updatedBy: data.updatedBy,
      })
      .where(and(eq(masterSantri.id, id), eq(masterSantri.pondokId, data.pondokId)))
      .returning();
      
    return updated as SantriEntity;
  }

  async softDelete(id: string, pondokId: string, deletedBy: string): Promise<SantriEntity> {
    const now = new Date().toISOString();
    
    const [deleted] = await db
      .update(masterSantri)
      .set({
        deletedAt: now,
        deletedBy: deletedBy,
      })
      .where(and(eq(masterSantri.id, id), eq(masterSantri.pondokId, pondokId)))
      .returning();
      
    return deleted as SantriEntity;
  }
}
