import { BaseService } from '@/lib/services/base.service';
import { KamarRepository } from '../repositories/kamar.repository';
import { CreateKamarInput, UpdateKamarInput } from '../validators/kamar.validator';
import { generateId } from '@/lib/utils';

export class KamarService extends BaseService {
  private repository: KamarRepository;

  constructor() {
    super();
    this.repository = new KamarRepository();
  }

  async getAllKamars(pondokId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.kamar.view');
    return this.repository.findAll(pondokId);
  }

  async getKamarById(id: string, pondokId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.kamar.view');
    return this.repository.findById(id, pondokId);
  }

  async createKamar(data: CreateKamarInput, userId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.kamar.create');

    const existingKamar = await this.repository.findByNameAndBlock(data.name, data.blockId, data.pondokId);
    if (existingKamar) {
      throw new Error(`Kamar dengan nama '${data.name}' sudah ada di blok ini.`);
    }

    const id = generateId('kamar');
    const newKamar = await this.repository.create({
      ...data,
      id,
      createdBy: userId,
    });

    await this.logAudit({
      module: 'MASTER_KAMAR',
      entity: 'master_room',
      entityId: id,
      action: 'CREATE',
      afterData: newKamar,
      performedBy: userId,
    });

    return newKamar;
  }

  async updateKamar(id: string, data: UpdateKamarInput, userId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.kamar.update');

    const existingKamar = await this.repository.findById(id, data.pondokId);
    if (!existingKamar) {
      throw new Error('Kamar tidak ditemukan.');
    }

    if (existingKamar.name !== data.name || existingKamar.blockId !== data.blockId) {
      const nameCheck = await this.repository.findByNameAndBlock(data.name, data.blockId, data.pondokId);
      if (nameCheck) {
        throw new Error(`Kamar dengan nama '${data.name}' sudah ada di blok ini.`);
      }
    }

    const updatedKamar = await this.repository.update(id, {
      ...data,
      updatedBy: userId,
    });

    await this.logAudit({
      module: 'MASTER_KAMAR',
      entity: 'master_room',
      entityId: id,
      action: 'UPDATE',
      beforeData: existingKamar,
      afterData: updatedKamar,
      performedBy: userId,
    });

    return updatedKamar;
  }

  async deleteKamar(id: string, pondokId: string, userId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.kamar.delete');

    const existingKamar = await this.repository.findById(id, pondokId);
    if (!existingKamar) {
      throw new Error('Kamar tidak ditemukan.');
    }

    // TODO: Cek apakah kamar sedang digunakan oleh santri
    // Jika digunakan, lempar Error

    const deletedKamar = await this.repository.softDelete(id, pondokId, userId);

    await this.logAudit({
      module: 'MASTER_KAMAR',
      entity: 'master_room',
      entityId: id,
      action: 'DELETE',
      beforeData: existingKamar,
      afterData: { deletedAt: deletedKamar.deletedAt, deletedBy: userId },
      performedBy: userId,
    });

    return deletedKamar;
  }
}
