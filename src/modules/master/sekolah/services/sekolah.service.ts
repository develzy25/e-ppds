import { BaseService } from '@/lib/services/base.service';
import { SekolahRepository } from '../repositories/sekolah.repository';
import { CreateSekolahInput, UpdateSekolahInput } from '../validators/sekolah.validator';
import { generateId } from '@/lib/utils';

export class SekolahService extends BaseService {
  private repository: SekolahRepository;

  constructor() {
    super();
    this.repository = new SekolahRepository();
  }

  async getAllSekolahs(pondokId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.sekolah.view');
    return this.repository.findAll(pondokId);
  }

  async getSekolahById(id: string, pondokId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.sekolah.view');
    return this.repository.findById(id, pondokId);
  }

  async createSekolah(data: CreateSekolahInput, userId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.sekolah.create');

    const existingSekolah = await this.repository.findByNameAndType(data.name, data.type, data.pondokId);
    if (existingSekolah) {
      throw new Error(`Sekolah dengan nama '${data.name}' dan tipe '${data.type}' sudah ada.`);
    }

    const id = generateId('sekolah');
    const newSekolah = await this.repository.create({
      ...data,
      id,
      createdBy: userId,
    });

    await this.logAudit({
      module: 'MASTER_SEKOLAH',
      entity: 'master_school',
      entityId: id,
      action: 'CREATE',
      afterData: newSekolah,
      performedBy: userId,
    });

    return newSekolah;
  }

  async updateSekolah(id: string, data: UpdateSekolahInput, userId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.sekolah.update');

    const existingSekolah = await this.repository.findById(id, data.pondokId);
    if (!existingSekolah) {
      throw new Error('Sekolah tidak ditemukan.');
    }

    if (existingSekolah.name !== data.name || existingSekolah.type !== data.type) {
      const nameCheck = await this.repository.findByNameAndType(data.name, data.type, data.pondokId);
      if (nameCheck) {
        throw new Error(`Sekolah dengan nama '${data.name}' dan tipe '${data.type}' sudah ada.`);
      }
    }

    const updatedSekolah = await this.repository.update(id, {
      ...data,
      updatedBy: userId,
    });

    await this.logAudit({
      module: 'MASTER_SEKOLAH',
      entity: 'master_school',
      entityId: id,
      action: 'UPDATE',
      beforeData: existingSekolah,
      afterData: updatedSekolah,
      performedBy: userId,
    });

    return updatedSekolah;
  }

  async deleteSekolah(id: string, pondokId: string, userId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.sekolah.delete');

    const existingSekolah = await this.repository.findById(id, pondokId);
    if (!existingSekolah) {
      throw new Error('Sekolah tidak ditemukan.');
    }

    // TODO: Cek apakah sekolah sedang digunakan oleh kelas atau santri
    // Jika digunakan, lempar Error

    const deletedSekolah = await this.repository.softDelete(id, pondokId, userId);

    await this.logAudit({
      module: 'MASTER_SEKOLAH',
      entity: 'master_school',
      entityId: id,
      action: 'DELETE',
      beforeData: existingSekolah,
      afterData: { deletedAt: deletedSekolah.deletedAt, deletedBy: userId },
      performedBy: userId,
    });

    return deletedSekolah;
  }
}
