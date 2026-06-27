import { AuditService } from '@/infrastructure/logger/audit/audit.service';
import { AuditRepository } from '@/infrastructure/logger/audit/audit.repository';
import { UnitOfWork } from '@/infrastructure/database/unit-of-work';
import { BlokRepository } from '../repositories/blok.repository';
import { CreateBlokInput, UpdateBlokInput } from '../validators/blok.validator';
import { generateId } from '@/shared/utils';
import { ConflictError, NotFoundError } from '@/lib/errors';
import { masterRoom } from '../../schemas/master.schema';
import { eq, and, isNull } from 'drizzle-orm';

export class BlokService {
  constructor(private readonly uow: UnitOfWork) {}
  private get repository() { return this.uow.repos.blok; }

  async getAllBloks(pondokId: string, userPermissions: string[]) {
    return this.repository.findAll(pondokId);
  }

  async getBlokById(id: string, pondokId: string, userPermissions: string[]) {
    return this.repository.findById(id, pondokId);
  }

  async createBlok(data: CreateBlokInput, userId: string, userPermissions: string[]) {

    const existingBlok = await this.repository.findByName(data.name, data.pondokId);
    if (existingBlok) {
      throw new ConflictError(`Blok dengan nama '${data.name}' sudah ada.`);
    }

    const id = generateId('blok');
    const newBlok = await this.repository.create({
      ...data,
      id,
      createdBy: userId,
    });

    await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
      module: 'MASTER_BLOK',
      entityName: 'master_block',
      entityId: id,
      action: 'CREATE',
      afterData: newBlok,
      performedBy: userId,
    });

    return newBlok;
  }

  async updateBlok(id: string, data: UpdateBlokInput, userId: string, userPermissions: string[]) {

    const existingBlok = await this.repository.findById(id, data.pondokId);
    if (!existingBlok) {
      throw new NotFoundError('Blok tidak ditemukan.');
    }

    if (existingBlok.name !== data.name) {
      const nameCheck = await this.repository.findByName(data.name, data.pondokId);
      if (nameCheck) {
        throw new ConflictError(`Blok dengan nama '${data.name}' sudah ada.`);
      }
    }

    const updatedBlok = await this.repository.update(id, {
      ...data,
      updatedBy: userId,
    });

    await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
      module: 'MASTER_BLOK',
      entityName: 'master_block',
      entityId: id,
      action: 'UPDATE',
      beforeData: existingBlok,
      afterData: updatedBlok,
      performedBy: userId,
    });

    return updatedBlok;
  }

  async deleteBlok(id: string, pondokId: string, userId: string, userPermissions: string[]) {

    const existingBlok = await this.repository.findById(id, pondokId);
    if (!existingBlok) {
      throw new NotFoundError('Blok tidak ditemukan.');
    }

    const roomExists = await this.uow.repos.client
      .select({ id: masterRoom.id })
      .from(masterRoom)
      .where(and(eq(masterRoom.blockId, id), isNull(masterRoom.deletedAt)))
      .limit(1);

    if (roomExists.length > 0) {
      await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
        module: 'MASTER_BLOK',
        entityName: 'master_block',
        entityId: id,
        action: 'DELETE_FAILED',
        beforeData: existingBlok,
        afterData: { reason: 'Data masih digunakan oleh entitas Kamar' },
        performedBy: userId,
      });
      throw new ConflictError('Blok tidak dapat dihapus karena masih digunakan oleh data Kamar.');
    }

    const deletedBlok = await this.repository.softDelete(id, pondokId, userId);

    await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
      module: 'MASTER_BLOK',
      entityName: 'master_block',
      entityId: id,
      action: 'DELETE',
      beforeData: existingBlok,
      afterData: { deletedAt: deletedBlok.deletedAt, deletedBy: userId },
      performedBy: userId,
    });

    return deletedBlok;
  }
}
