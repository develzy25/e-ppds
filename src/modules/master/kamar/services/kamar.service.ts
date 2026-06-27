import { AuditService } from '@/infrastructure/logger/audit/audit.service';
import { AuditRepository } from '@/infrastructure/logger/audit/audit.repository';
import { UnitOfWork } from '@/infrastructure/database/unit-of-work';
import { KamarRepository } from '../repositories/kamar.repository';
import { CreateKamarInput, UpdateKamarInput } from '../validators/kamar.validator';
import { generateId } from '@/shared/utils';
import { ConflictError, NotFoundError } from '@/lib/errors';
import { masterSantri } from '../../schemas/master.schema';
import { eq, and, isNull } from 'drizzle-orm';

export class KamarService {
  constructor(private readonly uow: UnitOfWork) {}
  private get repository() { return this.uow.repos.kamar; }

  async getAllKamars(pondokId: string, userPermissions: string[]) {
    return this.repository.findAll(pondokId);
  }

  async getKamarById(id: string, pondokId: string, userPermissions: string[]) {
    return this.repository.findById(id, pondokId);
  }

  async createKamar(data: CreateKamarInput, userId: string, userPermissions: string[]) {

    const existingKamar = await this.repository.findByNameAndBlock(data.name, data.blockId, data.pondokId);
    if (existingKamar) {
      throw new ConflictError(`Kamar dengan nama '${data.name}' sudah ada di blok ini.`);
    }

    const id = generateId('kamar');
    const newKamar = await this.repository.create({
      ...data,
      id,
      createdBy: userId,
    });

    await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
      module: 'MASTER_KAMAR',
      entityName: 'master_room',
      entityId: id,
      action: 'CREATE',
      afterData: newKamar,
      performedBy: userId,
    });

    return newKamar;
  }

  async updateKamar(id: string, data: UpdateKamarInput, userId: string, userPermissions: string[]) {

    const existingKamar = await this.repository.findById(id, data.pondokId);
    if (!existingKamar) {
      throw new NotFoundError('Kamar tidak ditemukan.');
    }

    if (existingKamar.name !== data.name || existingKamar.blockId !== data.blockId) {
      const nameCheck = await this.repository.findByNameAndBlock(data.name, data.blockId, data.pondokId);
      if (nameCheck) {
        throw new ConflictError(`Kamar dengan nama '${data.name}' sudah ada di blok ini.`);
      }
    }

    const updatedKamar = await this.repository.update(id, {
      ...data,
      updatedBy: userId,
    });

    await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
      module: 'MASTER_KAMAR',
      entityName: 'master_room',
      entityId: id,
      action: 'UPDATE',
      beforeData: existingKamar,
      afterData: updatedKamar,
      performedBy: userId,
    });

    return updatedKamar;
  }

  async deleteKamar(id: string, pondokId: string, userId: string, userPermissions: string[]) {

    const existingKamar = await this.repository.findById(id, pondokId);
    if (!existingKamar) {
      throw new NotFoundError('Kamar tidak ditemukan.');
    }

    const santriExists = await this.uow.repos.client
      .select({ id: masterSantri.id })
      .from(masterSantri)
      .where(and(eq(masterSantri.roomId, id), isNull(masterSantri.deletedAt)))
      .limit(1);

    if (santriExists.length > 0) {
      await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
        module: 'MASTER_KAMAR',
        entityName: 'master_room',
        entityId: id,
        action: 'DELETE_FAILED',
        beforeData: existingKamar,
        afterData: { reason: 'Data masih digunakan oleh entitas Santri' },
        performedBy: userId,
      });
      throw new ConflictError('Kamar tidak dapat dihapus karena masih digunakan oleh data Santri.');
    }

    const deletedKamar = await this.repository.softDelete(id, pondokId, userId);

    await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
      module: 'MASTER_KAMAR',
      entityName: 'master_room',
      entityId: id,
      action: 'DELETE',
      beforeData: existingKamar,
      afterData: { deletedAt: deletedKamar.deletedAt, deletedBy: userId },
      performedBy: userId,
    });

    return deletedKamar;
  }
}
