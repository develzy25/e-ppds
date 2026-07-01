import { BaseRepository } from '@/infrastructure/database/repositories/base.repository';
import { keuanganMasterJenisTagihan } from '../schemas/keuangan.schema';
import { eq, and, isNull } from 'drizzle-orm';
import { CreateJenisTagihanDTO, UpdateJenisTagihanDTO } from '../validators/jenis-tagihan.validator';
import { JenisTagihanEntity } from '../types/jenis-tagihan.type';

export class JenisTagihanRepository extends BaseRepository<typeof keuanganMasterJenisTagihan> {
  constructor(dbClient?: any) {
    super(keuanganMasterJenisTagihan, dbClient);
  }

  async findAll(pondokId: string): Promise<JenisTagihanEntity[]> {
    return this.databaseClient
      .select()
      .from(keuanganMasterJenisTagihan)
      .where(and(eq(keuanganMasterJenisTagihan.pondokId, pondokId), isNull(keuanganMasterJenisTagihan.deletedAt)));
  }

  async findById(id: string, pondokId: string): Promise<JenisTagihanEntity | undefined> {
    const result = await this.databaseClient
      .select()
      .from(keuanganMasterJenisTagihan)
      .where(and(eq(keuanganMasterJenisTagihan.id, id), eq(keuanganMasterJenisTagihan.pondokId, pondokId), isNull(keuanganMasterJenisTagihan.deletedAt)))
      .limit(1);
    
    return result[0];
  }

  async findByName(name: string, pondokId: string): Promise<JenisTagihanEntity | undefined> {
    const result = await this.databaseClient
      .select()
      .from(keuanganMasterJenisTagihan)
      .where(and(eq(keuanganMasterJenisTagihan.name, name), eq(keuanganMasterJenisTagihan.pondokId, pondokId), isNull(keuanganMasterJenisTagihan.deletedAt)))
      .limit(1);
    
    return result[0];
  }

  async create(data: CreateJenisTagihanDTO & { id: string; createdBy: string }): Promise<JenisTagihanEntity> {
    const now = new Date().toISOString();
    
    const [created] = await this.databaseClient
      .insert(keuanganMasterJenisTagihan)
      .values({
        id: data.id,
        name: data.name,
        category: data.category,
        description: data.description || null,
        isActive: data.isActive ?? true,
        pondokId: data.pondokId,
        createdAt: now,
        updatedAt: now,
        createdBy: data.createdBy,
        updatedBy: data.createdBy,
      })
      .returning();
      
    return created;
  }

  async update(id: string, data: UpdateJenisTagihanDTO & { updatedBy: string }): Promise<JenisTagihanEntity> {
    const now = new Date().toISOString();
    
    const [updated] = await this.databaseClient
      .update(keuanganMasterJenisTagihan)
      .set({
        name: data.name,
        category: data.category,
        description: data.description || null,
        isActive: data.isActive,
        updatedAt: now,
        updatedBy: data.updatedBy,
      })
      .where(and(eq(keuanganMasterJenisTagihan.id, id), eq(keuanganMasterJenisTagihan.pondokId, data.pondokId)))
      .returning();
      
    return updated;
  }

  async softDelete(id: string, pondokId: string, deletedBy: string): Promise<JenisTagihanEntity> {
    const now = new Date().toISOString();
    
    const [deleted] = await this.databaseClient
      .update(keuanganMasterJenisTagihan)
      .set({
        deletedAt: now,
        deletedBy: deletedBy,
      })
      .where(and(eq(keuanganMasterJenisTagihan.id, id), eq(keuanganMasterJenisTagihan.pondokId, pondokId)))
      .returning();
      
    return deleted;
  }
}
