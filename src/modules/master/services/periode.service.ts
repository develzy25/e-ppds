import { AuditService } from '@/infrastructure/logger/audit/audit.service';
import { AuditRepository } from '@/infrastructure/logger/audit/audit.repository';
import { UnitOfWork } from '@/infrastructure/database/unit-of-work';
import { PeriodeRepository } from '../repositories/periode.repository';
import { CreatePeriodeInput, UpdatePeriodeInput } from '../validators/periode.validator';
import { generateId } from '@/shared/utils';
import { ConflictError, NotFoundError } from '@/infrastructure/errors';
import { pengurusPositions, masterPengurus } from '../schemas/master.schema';
import { eq, and, isNull } from 'drizzle-orm';

export class PeriodeService {
  constructor(private readonly uow: UnitOfWork) {}
  private get repository() { return this.uow.repos.periode; }

  async getAllPeriodes(pondokId: string, userPermissions: string[]) {
    return this.repository.findAll(pondokId);
  }

  async getPeriodeById(id: string, pondokId: string, userPermissions: string[]) {
    return this.repository.findById(id, pondokId);
  }

  async createPeriode(data: CreatePeriodeInput, userId: string, userPermissions: string[]) {

    const existingPeriode = await this.repository.findByName(data.name, data.pondokId);
    if (existingPeriode) {
      throw new ConflictError(`Periode dengan nama '${data.name}' sudah ada.`);
    }

    const id = generateId('period');
    const newPeriode = await this.repository.create({
      ...data,
      id,
      createdBy: userId,
    });

    await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
      module: 'MASTER_PERIODE',
      entityName: 'master_period',
      entityId: id,
      action: 'CREATE',
      afterData: newPeriode,
      performedBy: userId,
    });

    return newPeriode;
  }

  async updatePeriode(id: string, data: UpdatePeriodeInput, userId: string, userPermissions: string[]) {

    const existingPeriode = await this.repository.findById(id, data.pondokId);
    if (!existingPeriode) {
      throw new NotFoundError('Periode tidak ditemukan.');
    }

    if (existingPeriode.name !== data.name) {
      const nameCheck = await this.repository.findByName(data.name, data.pondokId);
      if (nameCheck) {
        throw new ConflictError(`Periode dengan nama '${data.name}' sudah ada.`);
      }
    }

    const updatedPeriode = await this.repository.update(id, {
      ...data,
      updatedBy: userId,
    });

    await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
      module: 'MASTER_PERIODE',
      entityName: 'master_period',
      entityId: id,
      action: 'UPDATE',
      beforeData: existingPeriode,
      afterData: updatedPeriode,
      performedBy: userId,
    });

    return updatedPeriode;
  }

  async deletePeriode(id: string, pondokId: string, userId: string, userPermissions: string[]) {

    const existingPeriode = await this.repository.findById(id, pondokId);
    if (!existingPeriode) {
      throw new NotFoundError('Periode tidak ditemukan.');
    }

    const positionsExists = await this.uow.repos.client
      .select({ id: pengurusPositions.id })
      .from(pengurusPositions)
      .innerJoin(masterPengurus, eq(pengurusPositions.pengurusId, masterPengurus.id))
      .where(and(eq(pengurusPositions.periodId, id), isNull(masterPengurus.deletedAt)))
      .limit(1);

    if (positionsExists.length > 0) {
      await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
        module: 'MASTER_PERIODE',
        entityName: 'master_period',
        entityId: id,
        action: 'DELETE_FAILED',
        beforeData: existingPeriode,
        afterData: { reason: 'Data masih digunakan oleh entitas Jabatan Pengurus' },
        performedBy: userId,
      });
      throw new ConflictError('Periode tidak dapat dihapus karena masih digunakan oleh data Pengurus.');
    }

    const deletedPeriode = await this.repository.softDelete(id, pondokId, userId);

    await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
      module: 'MASTER_PERIODE',
      entityName: 'master_period',
      entityId: id,
      action: 'DELETE',
      beforeData: existingPeriode,
      afterData: { deletedAt: deletedPeriode.deletedAt, deletedBy: userId },
      performedBy: userId,
    });

    return deletedPeriode;
  }
}
