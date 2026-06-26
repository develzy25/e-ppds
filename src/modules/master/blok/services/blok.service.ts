import { BaseService } from '@/lib/services/base.service';
import { BlokRepository } from '../repositories/blok.repository';
import { CreateBlokInput, UpdateBlokInput } from '../validators/blok.validator';
import { generateId } from '@/lib/utils';

export class BlokService extends BaseService {
  private repository: BlokRepository;

  constructor() {
    super();
    this.repository = new BlokRepository();
  }

  async getAllBloks(pondokId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.blok.view');
    return this.repository.findAll(pondokId);
  }

  async getBlokById(id: string, pondokId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.blok.view');
    return this.repository.findById(id, pondokId);
  }

  async createBlok(data: CreateBlokInput, userId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.blok.create');

    const existingBlok = await this.repository.findByName(data.name, data.pondokId);
    if (existingBlok) {
      throw new Error(`Blok dengan nama '${data.name}' sudah ada.`);
    }

    const id = generateId('blok');
    const newBlok = await this.repository.create({
      ...data,
      id,
      createdBy: userId,
    });

    await this.logAudit({
      module: 'MASTER_BLOK',
      entity: 'master_block',
      entityId: id,
      action: 'CREATE',
      afterData: newBlok,
      performedBy: userId,
    });

    return newBlok;
  }

  async updateBlok(id: string, data: UpdateBlokInput, userId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.blok.update');

    const existingBlok = await this.repository.findById(id, data.pondokId);
    if (!existingBlok) {
      throw new Error('Blok tidak ditemukan.');
    }

    if (existingBlok.name !== data.name) {
      const nameCheck = await this.repository.findByName(data.name, data.pondokId);
      if (nameCheck) {
        throw new Error(`Blok dengan nama '${data.name}' sudah ada.`);
      }
    }

    const updatedBlok = await this.repository.update(id, {
      ...data,
      updatedBy: userId,
    });

    await this.logAudit({
      module: 'MASTER_BLOK',
      entity: 'master_block',
      entityId: id,
      action: 'UPDATE',
      beforeData: existingBlok,
      afterData: updatedBlok,
      performedBy: userId,
    });

    return updatedBlok;
  }

  async deleteBlok(id: string, pondokId: string, userId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.blok.delete');

    const existingBlok = await this.repository.findById(id, pondokId);
    if (!existingBlok) {
      throw new Error('Blok tidak ditemukan.');
    }

    // TODO: Cek apakah blok sedang digunakan oleh kamar atau santri
    // Jika digunakan, lempar Error

    const deletedBlok = await this.repository.softDelete(id, pondokId, userId);

    await this.logAudit({
      module: 'MASTER_BLOK',
      entity: 'master_block',
      entityId: id,
      action: 'DELETE',
      beforeData: existingBlok,
      afterData: { deletedAt: deletedBlok.deletedAt, deletedBy: userId },
      performedBy: userId,
    });

    return deletedBlok;
  }
}
