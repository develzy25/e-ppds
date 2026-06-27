import { AuditService } from '@/infrastructure/logger/audit/audit.service';
import { AuditRepository } from '@/infrastructure/logger/audit/audit.repository';
import { UnitOfWork } from '@/infrastructure/database/unit-of-work';
import { SekolahRepository } from '../repositories/sekolah.repository';
import { CreateSekolahInput, UpdateSekolahInput } from '../validators/sekolah.validator';
import { generateId } from '@/shared/utils';
import { ConflictError, NotFoundError } from '@/lib/errors';
import { masterClass } from '../../schemas/master.schema';
import { eq, and, isNull } from 'drizzle-orm';

export class SekolahService {
  constructor(private readonly uow: UnitOfWork) {}
  private get repository() { return this.uow.repos.sekolah; }

  async getAllSekolahs(pondokId: string, userPermissions: string[]) {
    return this.repository.findAll(pondokId);
  }

  async getSekolahById(id: string, pondokId: string, userPermissions: string[]) {
    return this.repository.findById(id, pondokId);
  }

  async createSekolah(data: CreateSekolahInput, userId: string, userPermissions: string[]) {

    const existingSekolah = await this.repository.findByNameAndType(data.name, data.type, data.pondokId);
    if (existingSekolah) {
      throw new ConflictError(`Sekolah dengan nama '${data.name}' dan tipe '${data.type}' sudah ada.`);
    }

    const id = generateId('sekolah');
    const newSekolah = await this.repository.create({
      ...data,
      id,
      createdBy: userId,
    });

    await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
      module: 'MASTER_SEKOLAH',
      entityName: 'master_school',
      entityId: id,
      action: 'CREATE',
      afterData: newSekolah,
      performedBy: userId,
    });

    return newSekolah;
  }

  async updateSekolah(id: string, data: UpdateSekolahInput, userId: string, userPermissions: string[]) {

    const existingSekolah = await this.repository.findById(id, data.pondokId);
    if (!existingSekolah) {
      throw new NotFoundError('Sekolah tidak ditemukan.');
    }

    if (existingSekolah.name !== data.name || existingSekolah.type !== data.type) {
      const nameCheck = await this.repository.findByNameAndType(data.name, data.type, data.pondokId);
      if (nameCheck) {
        throw new ConflictError(`Sekolah dengan nama '${data.name}' dan tipe '${data.type}' sudah ada.`);
      }
    }

    const updatedSekolah = await this.repository.update(id, {
      ...data,
      updatedBy: userId,
    });

    await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
      module: 'MASTER_SEKOLAH',
      entityName: 'master_school',
      entityId: id,
      action: 'UPDATE',
      beforeData: existingSekolah,
      afterData: updatedSekolah,
      performedBy: userId,
    });

    return updatedSekolah;
  }

  async deleteSekolah(id: string, pondokId: string, userId: string, userPermissions: string[]) {

    const existingSekolah = await this.repository.findById(id, pondokId);
    if (!existingSekolah) {
      throw new NotFoundError('Sekolah tidak ditemukan.');
    }

    const classExists = await this.uow.repos.client
      .select({ id: masterClass.id })
      .from(masterClass)
      .where(and(eq(masterClass.schoolId, id), isNull(masterClass.deletedAt)))
      .limit(1);

    if (classExists.length > 0) {
      await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
        module: 'MASTER_SEKOLAH',
        entityName: 'master_school',
        entityId: id,
        action: 'DELETE_FAILED',
        beforeData: existingSekolah,
        afterData: { reason: 'Data masih digunakan oleh entitas Kelas' },
        performedBy: userId,
      });
      throw new ConflictError('Sekolah tidak dapat dihapus karena masih digunakan oleh data Kelas.');
    }

    const deletedSekolah = await this.repository.softDelete(id, pondokId, userId);

    await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
      module: 'MASTER_SEKOLAH',
      entityName: 'master_school',
      entityId: id,
      action: 'DELETE',
      beforeData: existingSekolah,
      afterData: { deletedAt: deletedSekolah.deletedAt, deletedBy: userId },
      performedBy: userId,
    });

    return deletedSekolah;
  }
}
