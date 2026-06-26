import { BaseService } from '@/lib/services/base.service';
import { TahunAjaranRepository } from '../repositories/tahun-ajaran.repository';
import { CreateTahunAjaranInput, UpdateTahunAjaranInput } from '../validators/tahun-ajaran.validator';
import { generateId } from '@/lib/utils';

export class TahunAjaranService extends BaseService {
  private repository: TahunAjaranRepository;

  constructor() {
    super();
    this.repository = new TahunAjaranRepository();
  }

  async getAllTahunAjarans(pondokId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.tahun_ajaran.view');
    return this.repository.findAll(pondokId);
  }

  async getTahunAjaranById(id: string, pondokId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.tahun_ajaran.view');
    return this.repository.findById(id, pondokId);
  }

  async createTahunAjaran(data: CreateTahunAjaranInput, userId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.tahun_ajaran.create');

    const existingTahunAjaran = await this.repository.findByName(data.name, data.pondokId);
    if (existingTahunAjaran) {
      throw new Error(`Tahun Ajaran dengan nama '${data.name}' sudah ada.`);
    }

    const id = generateId('year');
    const newTahunAjaran = await this.repository.create({
      ...data,
      id,
      createdBy: userId,
    });

    await this.logAudit({
      module: 'MASTER_TAHUN_AJARAN',
      entity: 'master_academic_year',
      entityId: id,
      action: 'CREATE',
      afterData: newTahunAjaran,
      performedBy: userId,
    });

    return newTahunAjaran;
  }

  async updateTahunAjaran(id: string, data: UpdateTahunAjaranInput, userId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.tahun_ajaran.update');

    const existingTahunAjaran = await this.repository.findById(id, data.pondokId);
    if (!existingTahunAjaran) {
      throw new Error('Tahun Ajaran tidak ditemukan.');
    }

    if (existingTahunAjaran.name !== data.name) {
      const nameCheck = await this.repository.findByName(data.name, data.pondokId);
      if (nameCheck) {
        throw new Error(`Tahun Ajaran dengan nama '${data.name}' sudah ada.`);
      }
    }

    const updatedTahunAjaran = await this.repository.update(id, {
      ...data,
      updatedBy: userId,
    });

    await this.logAudit({
      module: 'MASTER_TAHUN_AJARAN',
      entity: 'master_academic_year',
      entityId: id,
      action: 'UPDATE',
      beforeData: existingTahunAjaran,
      afterData: updatedTahunAjaran,
      performedBy: userId,
    });

    return updatedTahunAjaran;
  }

  async deleteTahunAjaran(id: string, pondokId: string, userId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.tahun_ajaran.delete');

    const existingTahunAjaran = await this.repository.findById(id, pondokId);
    if (!existingTahunAjaran) {
      throw new Error('Tahun Ajaran tidak ditemukan.');
    }

    // TODO: Cek apakah tahun ajaran sedang digunakan oleh santri
    // Jika digunakan, lempar Error

    const deletedTahunAjaran = await this.repository.softDelete(id, pondokId, userId);

    await this.logAudit({
      module: 'MASTER_TAHUN_AJARAN',
      entity: 'master_academic_year',
      entityId: id,
      action: 'DELETE',
      beforeData: existingTahunAjaran,
      afterData: { deletedAt: deletedTahunAjaran.deletedAt, deletedBy: userId },
      performedBy: userId,
    });

    return deletedTahunAjaran;
  }
}
