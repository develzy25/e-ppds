import { BaseService } from '@/lib/services/base.service';
import { KelasRepository } from '../repositories/kelas.repository';
import { CreateKelasInput, UpdateKelasInput } from '../validators/kelas.validator';
import { generateId } from '@/lib/utils';

export class KelasService extends BaseService {
  private repository: KelasRepository;

  constructor() {
    super();
    this.repository = new KelasRepository();
  }

  async getAllKelass(pondokId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.kelas.view');
    return this.repository.findAll(pondokId);
  }

  async getKelasById(id: string, pondokId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.kelas.view');
    return this.repository.findById(id, pondokId);
  }

  async createKelas(data: CreateKelasInput, userId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.kelas.create');

    const existingKelas = await this.repository.findByNameAndSchool(data.name, data.schoolId, data.pondokId);
    if (existingKelas) {
      throw new Error(`Kelas dengan nama '${data.name}' sudah ada di sekolah ini.`);
    }

    const id = generateId('kelas');
    const newKelas = await this.repository.create({
      ...data,
      id,
      createdBy: userId,
    });

    await this.logAudit({
      module: 'MASTER_KELAS',
      entity: 'master_class',
      entityId: id,
      action: 'CREATE',
      afterData: newKelas,
      performedBy: userId,
    });

    return newKelas;
  }

  async updateKelas(id: string, data: UpdateKelasInput, userId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.kelas.update');

    const existingKelas = await this.repository.findById(id, data.pondokId);
    if (!existingKelas) {
      throw new Error('Kelas tidak ditemukan.');
    }

    if (existingKelas.name !== data.name || existingKelas.schoolId !== data.schoolId) {
      const nameCheck = await this.repository.findByNameAndSchool(data.name, data.schoolId, data.pondokId);
      if (nameCheck) {
        throw new Error(`Kelas dengan nama '${data.name}' sudah ada di sekolah ini.`);
      }
    }

    const updatedKelas = await this.repository.update(id, {
      ...data,
      updatedBy: userId,
    });

    await this.logAudit({
      module: 'MASTER_KELAS',
      entity: 'master_class',
      entityId: id,
      action: 'UPDATE',
      beforeData: existingKelas,
      afterData: updatedKelas,
      performedBy: userId,
    });

    return updatedKelas;
  }

  async deleteKelas(id: string, pondokId: string, userId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.kelas.delete');

    const existingKelas = await this.repository.findById(id, pondokId);
    if (!existingKelas) {
      throw new Error('Kelas tidak ditemukan.');
    }

    // TODO: Cek apakah kelas sedang digunakan oleh santri
    // Jika digunakan, lempar Error

    const deletedKelas = await this.repository.softDelete(id, pondokId, userId);

    await this.logAudit({
      module: 'MASTER_KELAS',
      entity: 'master_class',
      entityId: id,
      action: 'DELETE',
      beforeData: existingKelas,
      afterData: { deletedAt: deletedKelas.deletedAt, deletedBy: userId },
      performedBy: userId,
    });

    return deletedKelas;
  }
}
