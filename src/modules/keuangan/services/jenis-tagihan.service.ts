import { JenisTagihanRepository } from '../repositories/jenis-tagihan.repository';
import { CreateJenisTagihanDTO, UpdateJenisTagihanDTO } from '../validators/jenis-tagihan.validator';
import { generateId } from '@/shared/utils';
import { ConflictError, NotFoundError } from '@/infrastructure/errors';
import { UnitOfWork } from '@/infrastructure/database/unit-of-work';
import { RepositoryFactory } from '@/infrastructure/database/repository-factory';
import { keuanganMasterTarif } from '../schemas/keuangan.schema';
import { eq, and, isNull } from 'drizzle-orm';
import { AuditService } from '@/infrastructure/logger/audit/audit.service';

export class JenisTagihanService {
  constructor(private readonly uow: UnitOfWork) {}

  async getAllJenisTagihan(pondokId: string, userPermissions: string[]) {
    return await this.uow.execute(async (repos, trx) => {
      return repos.createJenisTagihanRepository().findAll(pondokId);
    });
  }

  async getJenisTagihanById(id: string, pondokId: string, userPermissions: string[]) {
    return await this.uow.execute(async (repos, trx) => {
      return repos.createJenisTagihanRepository().findById(id, pondokId);
    });
  }

  async createJenisTagihan(data: CreateJenisTagihanDTO, userId: string, userPermissions: string[]) {
    return await this.uow.execute(async (repos, trx) => {
      const repo = repos.createJenisTagihanRepository();
      
      const existingName = await repo.findByName(data.name, data.pondokId);
      if (existingName) {
        throw new ConflictError(`Jenis Tagihan dengan nama '${data.name}' sudah ada.`);
      }

      const id = generateId('jtag');
      const newRecord = await repo.create({
        ...data,
        id,
        createdBy: userId,
      });

      const auditService = new AuditService(trx);
      await auditService.writeAuditLog({
        module: 'KEUANGAN',
        entityName: 'keuangan_master_jenis_tagihan',
        entityId: id,
        action: 'CREATE',
        afterData: newRecord,
        performedBy: userId,
      });

      return newRecord;
    });
  }

  async updateJenisTagihan(id: string, data: UpdateJenisTagihanDTO, userId: string, userPermissions: string[]) {
    return await this.uow.execute(async (repos, trx) => {
      const repo = repos.createJenisTagihanRepository();

      const existingRecord = await repo.findById(id, data.pondokId);
      if (!existingRecord) {
        throw new NotFoundError('Jenis Tagihan tidak ditemukan.');
      }

      if (existingRecord.name !== data.name) {
        const nameCheck = await repo.findByName(data.name, data.pondokId);
        if (nameCheck) {
          throw new ConflictError(`Jenis Tagihan dengan nama '${data.name}' sudah ada.`);
        }
      }

      const updatedRecord = await repo.update(id, {
        ...data,
        updatedBy: userId,
      });

      const auditService = new AuditService(trx);
      await auditService.writeAuditLog({
        module: 'KEUANGAN',
        entityName: 'keuangan_master_jenis_tagihan',
        entityId: id,
        action: 'UPDATE',
        beforeData: existingRecord,
        afterData: updatedRecord,
        performedBy: userId,
      });

      return updatedRecord;
    });
  }

  async deleteJenisTagihan(id: string, pondokId: string, userId: string, userPermissions: string[]) {
    return await this.uow.execute(async (repos, trx) => {
      const repo = repos.createJenisTagihanRepository();

      const existingRecord = await repo.findById(id, pondokId);
      if (!existingRecord) {
        throw new NotFoundError('Jenis Tagihan tidak ditemukan.');
      }

      // Referential Integrity Check
      const tarifExists = await trx
        .select({ id: keuanganMasterTarif.id })
        .from(keuanganMasterTarif)
        .where(and(eq(keuanganMasterTarif.jenisTagihanId, id), isNull(keuanganMasterTarif.deletedAt)))
        .limit(1);

      if (tarifExists.length > 0) {
        throw new ConflictError('Tidak dapat menghapus Jenis Tagihan yang masih digunakan oleh Tarif aktif.');
      }

      const deletedRecord = await repo.softDelete(id, pondokId, userId);

      const auditService = new AuditService(trx);
      await auditService.writeAuditLog({
        module: 'KEUANGAN',
        entityName: 'keuangan_master_jenis_tagihan',
        entityId: id,
        action: 'DELETE',
        beforeData: existingRecord,
        performedBy: userId,
      });

      return deletedRecord;
    });
  }
}
