import { BaseService } from '@/lib/services/base.service';
import { SantriRepository } from '../repositories/santri.repository';
import { CreateSantriInput, UpdateSantriInput } from '../validators/santri.validator';
import { generateId } from '@/lib/utils';

export class SantriService extends BaseService {
  private repository: SantriRepository;

  constructor() {
    super();
    this.repository = new SantriRepository();
  }

  async getAllSantris(pondokId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.santri.view');
    return this.repository.findAll(pondokId);
  }

  async getSantriById(id: string, pondokId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.santri.view');
    return this.repository.findById(id, pondokId);
  }

  async createSantri(data: CreateSantriInput, userId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.santri.create');

    const existingSantri = await this.repository.findByNis(data.nis, data.pondokId);
    if (existingSantri) {
      throw new Error(`NIS '${data.nis}' sudah digunakan oleh santri lain.`);
    }

    const id = generateId('santri');
    const newSantri = await this.repository.create({
      ...data,
      id,
      createdBy: userId,
    });

    await this.logAudit({
      module: 'MASTER_SANTRI',
      entity: 'master_santri',
      entityId: id,
      action: 'CREATE',
      afterData: newSantri,
      performedBy: userId,
    });

    return newSantri;
  }

  async updateSantri(id: string, data: UpdateSantriInput, userId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.santri.update');

    const existingSantri = await this.repository.findById(id, data.pondokId);
    if (!existingSantri) {
      throw new Error('Santri tidak ditemukan.');
    }

    if (existingSantri.nis !== data.nis) {
      const nisCheck = await this.repository.findByNis(data.nis, data.pondokId);
      if (nisCheck) {
        throw new Error(`NIS '${data.nis}' sudah digunakan oleh santri lain.`);
      }
    }

    const updatedSantri = await this.repository.update(id, {
      ...data,
      updatedBy: userId,
    });

    await this.logAudit({
      module: 'MASTER_SANTRI',
      entity: 'master_santri',
      entityId: id,
      action: 'UPDATE',
      beforeData: existingSantri,
      afterData: updatedSantri,
      performedBy: userId,
    });

    return updatedSantri;
  }

  async deleteSantri(id: string, pondokId: string, userId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.santri.delete');

    const existingSantri = await this.repository.findById(id, pondokId);
    if (!existingSantri) {
      throw new Error('Santri tidak ditemukan.');
    }

    const deletedSantri = await this.repository.softDelete(id, pondokId, userId);

    await this.logAudit({
      module: 'MASTER_SANTRI',
      entity: 'master_santri',
      entityId: id,
      action: 'DELETE',
      beforeData: existingSantri,
      afterData: { deletedAt: deletedSantri.deletedAt, deletedBy: userId },
      performedBy: userId,
    });

    return deletedSantri;
  }
}
