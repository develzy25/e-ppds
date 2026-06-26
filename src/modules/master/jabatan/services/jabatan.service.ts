import { BaseService } from '@/lib/services/base.service';
import { JabatanRepository } from '../repositories/jabatan.repository';
import { CreateJabatanInput, UpdateJabatanInput } from '../validators/jabatan.validator';
import { generateId } from '@/lib/utils';

export class JabatanService extends BaseService {
  private repository: JabatanRepository;

  constructor() {
    super();
    this.repository = new JabatanRepository();
  }

  async getAllJabatans(pondokId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.jabatan.view');
    return this.repository.findAll(pondokId);
  }

  async getJabatanById(id: string, pondokId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.jabatan.view');
    return this.repository.findById(id, pondokId);
  }

  async createJabatan(data: CreateJabatanInput, userId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.jabatan.create');

    const existingJabatan = await this.repository.findByNameAndDepartment(data.name, data.departmentId, data.pondokId);
    if (existingJabatan) {
      throw new Error(`Jabatan dengan nama '${data.name}' sudah ada di department ini.`);
    }

    const id = generateId('jabatan');
    const newJabatan = await this.repository.create({
      ...data,
      id,
      createdBy: userId,
    });

    await this.logAudit({
      module: 'MASTER_JABATAN',
      entity: 'master_position',
      entityId: id,
      action: 'CREATE',
      afterData: newJabatan,
      performedBy: userId,
    });

    return newJabatan;
  }

  async updateJabatan(id: string, data: UpdateJabatanInput, userId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.jabatan.update');

    const existingJabatan = await this.repository.findById(id, data.pondokId);
    if (!existingJabatan) {
      throw new Error('Jabatan tidak ditemukan.');
    }

    if (existingJabatan.name !== data.name || existingJabatan.departmentId !== data.departmentId) {
      const nameCheck = await this.repository.findByNameAndDepartment(data.name, data.departmentId, data.pondokId);
      if (nameCheck) {
        throw new Error(`Jabatan dengan nama '${data.name}' sudah ada di department ini.`);
      }
    }

    const updatedJabatan = await this.repository.update(id, {
      ...data,
      updatedBy: userId,
    });

    await this.logAudit({
      module: 'MASTER_JABATAN',
      entity: 'master_position',
      entityId: id,
      action: 'UPDATE',
      beforeData: existingJabatan,
      afterData: updatedJabatan,
      performedBy: userId,
    });

    return updatedJabatan;
  }

  async deleteJabatan(id: string, pondokId: string, userId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.jabatan.delete');

    const existingJabatan = await this.repository.findById(id, pondokId);
    if (!existingJabatan) {
      throw new Error('Jabatan tidak ditemukan.');
    }

    // TODO: Cek apakah jabatan sedang digunakan oleh pengurus
    // Jika digunakan, lempar Error

    const deletedJabatan = await this.repository.softDelete(id, pondokId, userId);

    await this.logAudit({
      module: 'MASTER_JABATAN',
      entity: 'master_position',
      entityId: id,
      action: 'DELETE',
      beforeData: existingJabatan,
      afterData: { deletedAt: deletedJabatan.deletedAt, deletedBy: userId },
      performedBy: userId,
    });

    return deletedJabatan;
  }
}
