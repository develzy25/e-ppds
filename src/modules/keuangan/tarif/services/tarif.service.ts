import { TarifRepository } from '../repositories/tarif.repository';
import { CreateTarifDTO, UpdateTarifDTO } from '../validators/tarif.validator';
import { generateId } from '@/shared/utils';
import { ConflictError, NotFoundError } from '@/lib/errors';
import { UnitOfWork } from '@/infrastructure/database/unit-of-work';
import { RepositoryFactory } from '@/infrastructure/database/repository-factory';
import { keuanganTagihan } from '../../schemas/keuangan.schema';
import { eq, and, isNull } from 'drizzle-orm';
import { AuditService } from '@/infrastructure/logger/audit/audit.service';

export class TarifService {
  constructor(private readonly uow: UnitOfWork) {}

  async getAllTarif(pondokId: string, userPermissions: string[]) {
    return await this.uow.execute(async (repos, trx) => {
      return repos.createTarifRepository().findAll(pondokId);
    });
  }

  async getTarifById(id: string, pondokId: string, userPermissions: string[]) {
    return await this.uow.execute(async (repos, trx) => {
      return repos.createTarifRepository().findById(id, pondokId);
    });
  }

  async createTarif(data: CreateTarifDTO, userId: string, userPermissions: string[]) {
    return await this.uow.execute(async (repos, trx) => {
      const repo = repos.createTarifRepository();

      const existingCombo = await repo.findByTagihanAndYear(data.jenisTagihanId, data.academicYearId, data.pondokId);
      if (existingCombo) {
        throw new ConflictError('Tarif untuk Jenis Tagihan dan Tahun Ajaran ini sudah ada.');
      }

      const id = generateId('tarf');
      const newRecord = await repo.create({
        ...data,
        id,
        createdBy: userId,
      });

      const auditService = new AuditService(trx);
      await auditService.writeAuditLog({
        module: 'KEUANGAN',
        entityName: 'keuangan_master_tarif',
        entityId: id,
        action: 'CREATE',
        afterData: newRecord,
        performedBy: userId,
      });

      return newRecord;
    });
  }

  async updateTarif(id: string, data: UpdateTarifDTO, userId: string, userPermissions: string[]) {
    return await this.uow.execute(async (repos, trx) => {
      const repo = repos.createTarifRepository();

      const existingRecord = await repo.findById(id, data.pondokId);
      if (!existingRecord) {
        throw new NotFoundError('Tarif tidak ditemukan.');
      }

      if (existingRecord.jenisTagihanId !== data.jenisTagihanId || existingRecord.academicYearId !== data.academicYearId) {
        const comboCheck = await repo.findByTagihanAndYear(data.jenisTagihanId, data.academicYearId, data.pondokId);
        if (comboCheck) {
          throw new ConflictError('Tarif untuk Jenis Tagihan dan Tahun Ajaran ini sudah ada.');
        }
      }

      const updatedRecord = await repo.update(id, {
        ...data,
        updatedBy: userId,
      });

      const auditService = new AuditService(trx);
      await auditService.writeAuditLog({
        module: 'KEUANGAN',
        entityName: 'keuangan_master_tarif',
        entityId: id,
        action: 'UPDATE',
        beforeData: existingRecord,
        afterData: updatedRecord,
        performedBy: userId,
      });

      return updatedRecord;
    });
  }

  async deleteTarif(id: string, pondokId: string, userId: string, userPermissions: string[]) {
    return await this.uow.execute(async (repos, trx) => {
      const repo = repos.createTarifRepository();

      const existingRecord = await repo.findById(id, pondokId);
      if (!existingRecord) {
        throw new NotFoundError('Tarif tidak ditemukan.');
      }

      // Referential Integrity: Check if Tagihan already generated for this combo
      const tagihanExists = await trx
        .select({ id: keuanganTagihan.id })
        .from(keuanganTagihan)
        .where(and(
          eq(keuanganTagihan.jenisTagihanId, existingRecord.jenisTagihanId),
          eq(keuanganTagihan.academicYearId, existingRecord.academicYearId),
          eq(keuanganTagihan.pondokId, pondokId),
          eq(keuanganTagihan.status, 'UNPAID')
        ))
        .limit(1);

      if (tagihanExists.length > 0) {
        throw new ConflictError('Tidak dapat menghapus Tarif karena sudah ada Tagihan aktif untuk jenis dan tahun ajaran ini.');
      }

      const deletedRecord = await repo.softDelete(id, pondokId, userId);

      const auditService = new AuditService(trx);
      await auditService.writeAuditLog({
        module: 'KEUANGAN',
        entityName: 'keuangan_master_tarif',
        entityId: id,
        action: 'DELETE',
        beforeData: existingRecord,
        performedBy: userId,
      });

      return deletedRecord;
    });
  }
}
