import { BaseRepository } from '@/infrastructure/database/repositories/base.repository';
import { keuanganMasterTarif, keuanganMasterJenisTagihan } from '../../schemas/keuangan.schema';
import { masterAcademicYear } from '@/modules/master/schemas/master.schema';
import { eq, and, isNull } from 'drizzle-orm';
import { CreateTarifDTO, UpdateTarifDTO } from '../validators/tarif.validator';
import { TarifEntity, TarifWithRelationsEntity } from '../types/tarif.type';

export class TarifRepository extends BaseRepository<typeof keuanganMasterTarif> {
  constructor(dbClient?: any) {
    super(keuanganMasterTarif, dbClient);
  }

  async findAll(pondokId: string): Promise<TarifWithRelationsEntity[]> {
    const records = await this.databaseClient
      .select({
        tarif: keuanganMasterTarif,
        jenisTagihan: {
          id: keuanganMasterJenisTagihan.id,
          name: keuanganMasterJenisTagihan.name,
          category: keuanganMasterJenisTagihan.category,
        },
        academicYear: {
          id: masterAcademicYear.id,
          name: masterAcademicYear.name,
        }
      })
      .from(keuanganMasterTarif)
      .leftJoin(keuanganMasterJenisTagihan, eq(keuanganMasterTarif.jenisTagihanId, keuanganMasterJenisTagihan.id))
      .leftJoin(masterAcademicYear, eq(keuanganMasterTarif.academicYearId, masterAcademicYear.id))
      .where(and(eq(keuanganMasterTarif.pondokId, pondokId), isNull(keuanganMasterTarif.deletedAt)));

    return records.map((r: any) => ({
      ...r.tarif,
      jenisTagihan: r.jenisTagihan as any,
      academicYear: r.academicYear as any,
    }));
  }

  async findById(id: string, pondokId: string): Promise<TarifEntity | undefined> {
    const result = await this.databaseClient
      .select()
      .from(keuanganMasterTarif)
      .where(and(eq(keuanganMasterTarif.id, id), eq(keuanganMasterTarif.pondokId, pondokId), isNull(keuanganMasterTarif.deletedAt)))
      .limit(1);
    
    return result[0];
  }

  async findByTagihanAndYear(jenisTagihanId: string, academicYearId: string, pondokId: string): Promise<TarifEntity | undefined> {
    const result = await this.databaseClient
      .select()
      .from(keuanganMasterTarif)
      .where(and(
        eq(keuanganMasterTarif.jenisTagihanId, jenisTagihanId),
        eq(keuanganMasterTarif.academicYearId, academicYearId),
        eq(keuanganMasterTarif.pondokId, pondokId),
        isNull(keuanganMasterTarif.deletedAt)
      ))
      .limit(1);
    
    return result[0];
  }

  async create(data: CreateTarifDTO & { id: string; createdBy: string }): Promise<TarifEntity> {
    const now = new Date().toISOString();
    
    const [created] = await this.databaseClient
      .insert(keuanganMasterTarif)
      .values({
        id: data.id,
        jenisTagihanId: data.jenisTagihanId,
        academicYearId: data.academicYearId,
        amount: data.amount,
        description: data.description || null,
        pondokId: data.pondokId,
        createdAt: now,
        updatedAt: now,
        createdBy: data.createdBy,
        updatedBy: data.createdBy,
      })
      .returning();
      
    return created;
  }

  async update(id: string, data: UpdateTarifDTO & { updatedBy: string }): Promise<TarifEntity> {
    const now = new Date().toISOString();
    
    const [updated] = await this.databaseClient
      .update(keuanganMasterTarif)
      .set({
        jenisTagihanId: data.jenisTagihanId,
        academicYearId: data.academicYearId,
        amount: data.amount,
        description: data.description || null,
        updatedAt: now,
        updatedBy: data.updatedBy,
      })
      .where(and(eq(keuanganMasterTarif.id, id), eq(keuanganMasterTarif.pondokId, data.pondokId)))
      .returning();
      
    return updated;
  }

  async softDelete(id: string, pondokId: string, deletedBy: string): Promise<TarifEntity> {
    const now = new Date().toISOString();
    
    const [deleted] = await this.databaseClient
      .update(keuanganMasterTarif)
      .set({
        deletedAt: now,
        deletedBy: deletedBy,
      })
      .where(and(eq(keuanganMasterTarif.id, id), eq(keuanganMasterTarif.pondokId, pondokId)))
      .returning();
      
    return deleted;
  }
}
