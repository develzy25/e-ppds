import { BaseService } from '@/lib/services/base.service';
import { PeriodeRepository } from '../repositories/periode.repository';
import { CreatePeriodeInput, UpdatePeriodeInput } from '../validators/periode.validator';
import { generateId } from '@/lib/utils';

export class PeriodeService extends BaseService {
  private repository: PeriodeRepository;

  constructor() {
    super();
    this.repository = new PeriodeRepository();
  }

  async getAllPeriodes(pondokId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.periode.view');
    return this.repository.findAll(pondokId);
  }

  async getPeriodeById(id: string, pondokId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.periode.view');
    return this.repository.findById(id, pondokId);
  }

  async createPeriode(data: CreatePeriodeInput, userId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.periode.create');

    const existingPeriode = await this.repository.findByName(data.name, data.pondokId);
    if (existingPeriode) {
      throw new Error(`Periode dengan nama '${data.name}' sudah ada.`);
    }

    const id = generateId('period');
    const newPeriode = await this.repository.create({
      ...data,
      id,
      createdBy: userId,
    });

    await this.logAudit({
      module: 'MASTER_PERIODE',
      entity: 'master_period',
      entityId: id,
      action: 'CREATE',
      afterData: newPeriode,
      performedBy: userId,
    });

    return newPeriode;
  }

  async updatePeriode(id: string, data: UpdatePeriodeInput, userId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.periode.update');

    const existingPeriode = await this.repository.findById(id, data.pondokId);
    if (!existingPeriode) {
      throw new Error('Periode tidak ditemukan.');
    }

    if (existingPeriode.name !== data.name) {
      const nameCheck = await this.repository.findByName(data.name, data.pondokId);
      if (nameCheck) {
        throw new Error(`Periode dengan nama '${data.name}' sudah ada.`);
      }
    }

    const updatedPeriode = await this.repository.update(id, {
      ...data,
      updatedBy: userId,
    });

    await this.logAudit({
      module: 'MASTER_PERIODE',
      entity: 'master_period',
      entityId: id,
      action: 'UPDATE',
      beforeData: existingPeriode,
      afterData: updatedPeriode,
      performedBy: userId,
    });

    return updatedPeriode;
  }

  async deletePeriode(id: string, pondokId: string, userId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.periode.delete');

    const existingPeriode = await this.repository.findById(id, pondokId);
    if (!existingPeriode) {
      throw new Error('Periode tidak ditemukan.');
    }

    // TODO: Cek apakah periode sedang digunakan oleh pengurus
    // Jika digunakan, lempar Error

    const deletedPeriode = await this.repository.softDelete(id, pondokId, userId);

    await this.logAudit({
      module: 'MASTER_PERIODE',
      entity: 'master_period',
      entityId: id,
      action: 'DELETE',
      beforeData: existingPeriode,
      afterData: { deletedAt: deletedPeriode.deletedAt, deletedBy: userId },
      performedBy: userId,
    });

    return deletedPeriode;
  }
}
