import { AuditService } from '@/infrastructure/logger/audit/audit.service';
import { AuditRepository } from '@/infrastructure/logger/audit/audit.repository';
import { UnitOfWork } from '@/infrastructure/database/unit-of-work';
import { KelasRepository } from '../repositories/kelas.repository';
import { CreateKelasInput, UpdateKelasInput } from '../validators/kelas.validator';
import { generateId } from '@/shared/utils';
import { ConflictError, NotFoundError } from '@/lib/errors';
import { masterSantri } from '../../schemas/master.schema';
import { eq, or, and, isNull } from 'drizzle-orm';

export class KelasService {
  constructor(private readonly uow: UnitOfWork) {}
  private get repository() { return this.uow.repos.kelas; }

  async getAllKelass(pondokId: string, userPermissions: string[]) {
    return this.repository.findAll(pondokId);
  }

  async getKelasById(id: string, pondokId: string, userPermissions: string[]) {
    return this.repository.findById(id, pondokId);
  }

  async createKelas(data: CreateKelasInput, userId: string, userPermissions: string[]) {

    const existingKelas = await this.repository.findByNameAndSchool(data.name, data.schoolId, data.pondokId);
    if (existingKelas) {
      throw new ConflictError(`Kelas dengan nama '${data.name}' sudah ada di sekolah ini.`);
    }

    const id = generateId('kelas');
    const newKelas = await this.repository.create({
      ...data,
      id,
      createdBy: userId,
    });

    await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
      module: 'MASTER_KELAS',
      entityName: 'master_class',
      entityId: id,
      action: 'CREATE',
      afterData: newKelas,
      performedBy: userId,
    });

    return newKelas;
  }

  async updateKelas(id: string, data: UpdateKelasInput, userId: string, userPermissions: string[]) {

    const existingKelas = await this.repository.findById(id, data.pondokId);
    if (!existingKelas) {
      throw new NotFoundError('Kelas tidak ditemukan.');
    }

    if (existingKelas.name !== data.name || existingKelas.schoolId !== data.schoolId) {
      const nameCheck = await this.repository.findByNameAndSchool(data.name, data.schoolId, data.pondokId);
      if (nameCheck) {
        throw new ConflictError(`Kelas dengan nama '${data.name}' sudah ada di sekolah ini.`);
      }
    }

    const updatedKelas = await this.repository.update(id, {
      ...data,
      updatedBy: userId,
    });

    await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
      module: 'MASTER_KELAS',
      entityName: 'master_class',
      entityId: id,
      action: 'UPDATE',
      beforeData: existingKelas,
      afterData: updatedKelas,
      performedBy: userId,
    });

    return updatedKelas;
  }

  async deleteKelas(id: string, pondokId: string, userId: string, userPermissions: string[]) {

    const existingKelas = await this.repository.findById(id, pondokId);
    if (!existingKelas) {
      throw new NotFoundError('Kelas tidak ditemukan.');
    }

    const santriExists = await this.uow.repos.client
      .select({ id: masterSantri.id })
      .from(masterSantri)
      .where(and(or(eq(masterSantri.classFormalId, id), eq(masterSantri.classDiniyahId, id)), isNull(masterSantri.deletedAt)))
      .limit(1);

    if (santriExists.length > 0) {
      await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
        module: 'MASTER_KELAS',
        entityName: 'master_class',
        entityId: id,
        action: 'DELETE_FAILED',
        beforeData: existingKelas,
        afterData: { reason: 'Data masih digunakan oleh entitas Santri' },
        performedBy: userId,
      });
      throw new ConflictError('Kelas tidak dapat dihapus karena masih digunakan oleh data Santri.');
    }

    const deletedKelas = await this.repository.softDelete(id, pondokId, userId);

    await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
      module: 'MASTER_KELAS',
      entityName: 'master_class',
      entityId: id,
      action: 'DELETE',
      beforeData: existingKelas,
      afterData: { deletedAt: deletedKelas.deletedAt, deletedBy: userId },
      performedBy: userId,
    });

    return deletedKelas;
  }
}
