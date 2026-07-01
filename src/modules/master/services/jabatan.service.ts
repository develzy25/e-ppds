import { AuditService } from '@/infrastructure/logger/audit/audit.service';
import { AuditRepository } from '@/infrastructure/logger/audit/audit.repository';
import { UnitOfWork } from '@/infrastructure/database/unit-of-work';
import { JabatanRepository } from '../repositories/jabatan.repository';
import { CreateJabatanInput, UpdateJabatanInput } from '../validators/jabatan.validator';
import { generateId } from '@/shared/utils';
import { ConflictError, NotFoundError } from '@/infrastructure/errors';
import { pengurusPositions, masterPengurus } from '../schemas/master.schema';
import { eq, and, isNull } from 'drizzle-orm';

export class JabatanService {
  constructor(private readonly uow: UnitOfWork) {}
  private get repository() { return this.uow.repos.jabatan; }

  async getAllJabatans(pondokId: string, userPermissions: string[]) {
    return this.repository.findAll(pondokId);
  }

  async getJabatanById(id: string, pondokId: string, userPermissions: string[]) {
    return this.repository.findById(id, pondokId);
  }

  async createJabatan(data: CreateJabatanInput, userId: string, userPermissions: string[]) {

    const existingJabatan = await this.repository.findByNameAndDepartment(data.name, data.departmentId, data.pondokId);
    if (existingJabatan) {
      throw new ConflictError(`Jabatan dengan nama '${data.name}' sudah ada di department ini.`);
    }

    const id = generateId('jabatan');
    const newJabatan = await this.repository.create({
      ...data,
      id,
      createdBy: userId,
    });

    await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
      module: 'MASTER_JABATAN',
      entityName: 'master_position',
      entityId: id,
      action: 'CREATE',
      afterData: newJabatan,
      performedBy: userId,
    });

    return newJabatan;
  }

  async updateJabatan(id: string, data: UpdateJabatanInput, userId: string, userPermissions: string[]) {

    const existingJabatan = await this.repository.findById(id, data.pondokId);
    if (!existingJabatan) {
      throw new NotFoundError('Jabatan tidak ditemukan.');
    }

    if (existingJabatan.name !== data.name || existingJabatan.departmentId !== data.departmentId) {
      const nameCheck = await this.repository.findByNameAndDepartment(data.name, data.departmentId, data.pondokId);
      if (nameCheck) {
        throw new ConflictError(`Jabatan dengan nama '${data.name}' sudah ada di department ini.`);
      }
    }

    const updatedJabatan = await this.repository.update(id, {
      ...data,
      updatedBy: userId,
    });

    await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
      module: 'MASTER_JABATAN',
      entityName: 'master_position',
      entityId: id,
      action: 'UPDATE',
      beforeData: existingJabatan,
      afterData: updatedJabatan,
      performedBy: userId,
    });

    return updatedJabatan;
  }

  async deleteJabatan(id: string, pondokId: string, userId: string, userPermissions: string[]) {

    const existingJabatan = await this.repository.findById(id, pondokId);
    if (!existingJabatan) {
      throw new NotFoundError('Jabatan tidak ditemukan.');
    }

    const jabatanExists = await this.uow.repos.client
      .select({ id: pengurusPositions.id })
      .from(pengurusPositions)
      .innerJoin(masterPengurus, eq(pengurusPositions.pengurusId, masterPengurus.id))
      .where(and(eq(pengurusPositions.positionId, id), isNull(masterPengurus.deletedAt)))
      .limit(1);

    if (jabatanExists.length > 0) {
      await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
        module: 'MASTER_JABATAN',
        entityName: 'master_position',
        entityId: id,
        action: 'DELETE_FAILED',
        beforeData: existingJabatan,
        afterData: { reason: 'Data masih digunakan oleh entitas Pengurus' },
        performedBy: userId,
      });
      throw new ConflictError('Jabatan tidak dapat dihapus karena masih digunakan oleh data Pengurus.');
    }

    const deletedJabatan = await this.repository.softDelete(id, pondokId, userId);

    await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
      module: 'MASTER_JABATAN',
      entityName: 'master_position',
      entityId: id,
      action: 'DELETE',
      beforeData: existingJabatan,
      afterData: { deletedAt: deletedJabatan.deletedAt, deletedBy: userId },
      performedBy: userId,
    });

    return deletedJabatan;
  }
}
