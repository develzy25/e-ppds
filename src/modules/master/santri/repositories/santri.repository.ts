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

import { BaseRepository, PaginatedResult } from '@/infrastructure/database/repositories/base.repository';
import { DbClient } from '@/infrastructure/database/repositories/base.repository';

export class SantriRepository extends BaseRepository<typeof masterSantri> {
  constructor(dbClient?: DbClient) {
    super(masterSantri, dbClient);
  }

  async findAllPaginated(pondokId: string, page: number = 1, limit: number = 20, filters?: Record<string, any>): Promise<PaginatedResult<SantriEntity>> {
    const classFormal = alias(masterClass, 'classFormal');
    const classDiniyah = alias(masterClass, 'classDiniyah');
    const offset = (page - 1) * limit;

    const baseConditions = this.buildBaseConditions(pondokId);
    
    // Add additional filters here if needed
    // if (filters?.status) baseConditions.push(eq(masterSantri.status, filters.status));

    const results = await this.databaseClient
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
      .where(and(...baseConditions))
      .limit(limit)
      .offset(offset);

    const data = results.map((row: any) => ({
      ...row.santri,
      kamar: row.kamar || undefined,
      classFormal: row.formal || undefined,
      classDiniyah: row.diniyah || undefined,
      academicYear: row.academicYear || undefined,
    })) as SantriEntity[];

    const totalItems = await this.countByConditions(pondokId);
    const meta = this.buildPaginationMeta(totalItems, page, limit, undefined, undefined, filters);

    return { data, meta };
  }

  async findAll(pondokId: string): Promise<SantriEntity[]> {
    const classFormal = alias(masterClass, 'classFormal');
    const classDiniyah = alias(masterClass, 'classDiniyah');

    const results = await this.databaseClient
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

    return results.map((row: any) => ({
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

    const results = await this.databaseClient
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

    if (results.length === 0) return undefined;
    const row = results[0] as any;
    return {
      ...row.santri,
      kamar: row.kamar || undefined,
      classFormal: row.formal || undefined,
      classDiniyah: row.diniyah || undefined,
      academicYear: row.academicYear || undefined,
    } as SantriEntity;
  }

  async findByNis(nis: string, pondokId: string): Promise<SantriEntity | undefined> {
    const results = await this.databaseClient
      .select()
      .from(masterSantri)
      .where(and(eq(masterSantri.nis, nis), eq(masterSantri.pondokId, pondokId), isNull(masterSantri.deletedAt)))
      .limit(1);
    
    return results[0] as SantriEntity | undefined;
  }

  async create(data: CreateSantriInput & { id: string; createdBy: string }): Promise<SantriEntity> {
    const now = new Date().toISOString();
    const result = await this.databaseClient
      .insert(masterSantri)
      .values({
        ...data,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
      
    return result[0] as SantriEntity;
  }

  async update(id: string, pondokId: string, data: UpdateSantriInput & { updatedBy: string }): Promise<SantriEntity> {
    const result = await this.databaseClient
      .update(masterSantri)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(and(eq(masterSantri.id, id), eq(masterSantri.pondokId, pondokId)))
      .returning();
      
    return result[0] as SantriEntity;
  }

  async softDelete(id: string, pondokId: string, deletedBy: string): Promise<void> {
    await this.databaseClient
      .update(masterSantri)
      .set({
        deletedAt: new Date().toISOString(),
        deletedBy,
      })
      .where(and(eq(masterSantri.id, id), eq(masterSantri.pondokId, pondokId)));
  }
}
