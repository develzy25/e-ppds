import { AuditService } from '@/infrastructure/logger/audit/audit.service';
import { AuditRepository } from '@/infrastructure/logger/audit/audit.repository';
import { UnitOfWork } from '@/infrastructure/database/unit-of-work';
import { TahunAjaranRepository } from '../repositories/tahun-ajaran.repository';
import { CreateTahunAjaranInput, UpdateTahunAjaranInput } from '../validators/tahun-ajaran.validator';
import { generateId } from '@/shared/utils';
import { ConflictError, NotFoundError } from '@/infrastructure/errors';
import { masterSantri } from '../schemas/master.schema';
import { eq, and, isNull } from 'drizzle-orm';

export class TahunAjaranService {
  constructor(private readonly uow: UnitOfWork) {}
  private get repository() { return this.uow.repos.tahunAjaran; }

  async getAllTahunAjarans(pondokId: string, userPermissions: string[]) {
    return this.repository.findAll(pondokId);
  }

  async getTahunAjaranById(id: string, pondokId: string, userPermissions: string[]) {
    return this.repository.findById(id, pondokId);
  }

  async createTahunAjaran(data: CreateTahunAjaranInput, userId: string, userPermissions: string[]) {

    const existingTahunAjaran = await this.repository.findByName(data.name, data.pondokId);
    if (existingTahunAjaran) {
      throw new ConflictError(`Tahun Ajaran dengan nama '${data.name}' sudah ada.`);
    }

    const id = generateId('year');
    const newTahunAjaran = await this.repository.create({
      ...data,
      id,
      createdBy: userId,
    });

    await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
      module: 'MASTER_TAHUN_AJARAN',
      entityName: 'master_academic_year',
      entityId: id,
      action: 'CREATE',
      afterData: newTahunAjaran,
      performedBy: userId,
    });

    return newTahunAjaran;
  }

  async updateTahunAjaran(id: string, data: UpdateTahunAjaranInput, userId: string, userPermissions: string[]) {

    const existingTahunAjaran = await this.repository.findById(id, data.pondokId);
    if (!existingTahunAjaran) {
      throw new NotFoundError('Tahun Ajaran tidak ditemukan.');
    }

    if (existingTahunAjaran.name !== data.name) {
      const nameCheck = await this.repository.findByName(data.name, data.pondokId);
      if (nameCheck) {
        throw new ConflictError(`Tahun Ajaran dengan nama '${data.name}' sudah ada.`);
      }
    }

    const updatedTahunAjaran = await this.repository.update(id, {
      ...data,
      updatedBy: userId,
    });

    await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
      module: 'MASTER_TAHUN_AJARAN',
      entityName: 'master_academic_year',
      entityId: id,
      action: 'UPDATE',
      beforeData: existingTahunAjaran,
      afterData: updatedTahunAjaran,
      performedBy: userId,
    });

    return updatedTahunAjaran;
  }

  async deleteTahunAjaran(id: string, pondokId: string, userId: string, userPermissions: string[]) {

    const existingTahunAjaran = await this.repository.findById(id, pondokId);
    if (!existingTahunAjaran) {
      throw new NotFoundError('Tahun Ajaran tidak ditemukan.');
    }

    const santriExists = await this.uow.repos.client
      .select({ id: masterSantri.id })
      .from(masterSantri)
      .where(and(eq(masterSantri.academicYearId, id), isNull(masterSantri.deletedAt)))
      .limit(1);

    if (santriExists.length > 0) {
      await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
        module: 'MASTER_TAHUN_AJARAN',
        entityName: 'master_academic_year',
        entityId: id,
        action: 'DELETE_FAILED',
        beforeData: existingTahunAjaran,
        afterData: { reason: 'Data masih digunakan oleh entitas Santri' },
        performedBy: userId,
      });
      throw new ConflictError('Tahun Ajaran tidak dapat dihapus karena masih digunakan oleh data Santri.');
    }

    const deletedTahunAjaran = await this.repository.softDelete(id, pondokId, userId);

    await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
      module: 'MASTER_TAHUN_AJARAN',
      entityName: 'master_academic_year',
      entityId: id,
      action: 'DELETE',
      beforeData: existingTahunAjaran,
      afterData: { deletedAt: deletedTahunAjaran.deletedAt, deletedBy: userId },
      performedBy: userId,
    });

    return deletedTahunAjaran;
  }
}
