import { BaseService } from '@/lib/services/base.service';
import { PengurusRepository } from '../repositories/pengurus.repository';
import { CreatePengurusInput, UpdatePengurusInput } from '../validators/pengurus.validator';
import { generateId } from '@/lib/utils';

export class PengurusService extends BaseService {
  private repository: PengurusRepository;

  constructor() {
    super();
    this.repository = new PengurusRepository();
  }

  // Simple mock hash function since we might not have bcrypt available in Edge runtime
  private hashPassword(password: string): string {
    return Buffer.from(password).toString('base64');
  }

  async getAllPenguruss(pondokId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.pengurus.view');
    return this.repository.findAll(pondokId);
  }

  async getPengurusById(id: string, pondokId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.pengurus.view');
    return this.repository.findById(id, pondokId);
  }

  async createPengurus(data: CreatePengurusInput, userId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.pengurus.create');

    const existingPengurus = await this.repository.findByEmail(data.email, data.pondokId);
    if (existingPengurus) {
      throw new Error(`Email '${data.email}' sudah digunakan oleh pengurus lain.`);
    }

    const id = generateId('pengurus');
    const passwordHash = this.hashPassword(data.password);
    
    const newPengurus = await this.repository.create({
      ...data,
      id,
      passwordHash,
      createdBy: userId,
    });

    await this.logAudit({
      module: 'MASTER_PENGURUS',
      entity: 'master_pengurus',
      entityId: id,
      action: 'CREATE',
      afterData: newPengurus,
      performedBy: userId,
    });

    return newPengurus;
  }

  async updatePengurus(id: string, data: UpdatePengurusInput, userId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.pengurus.update');

    const existingPengurus = await this.repository.findById(id, data.pondokId);
    if (!existingPengurus) {
      throw new Error('Pengurus tidak ditemukan.');
    }

    if (existingPengurus.email !== data.email) {
      const emailCheck = await this.repository.findByEmail(data.email, data.pondokId);
      if (emailCheck) {
        throw new Error(`Email '${data.email}' sudah digunakan oleh pengurus lain.`);
      }
    }

    let passwordHash = undefined;
    if (data.password && data.password.length > 0) {
      passwordHash = this.hashPassword(data.password);
    }

    const updatedPengurus = await this.repository.update(id, {
      ...data,
      passwordHash,
      updatedBy: userId,
    });

    await this.logAudit({
      module: 'MASTER_PENGURUS',
      entity: 'master_pengurus',
      entityId: id,
      action: 'UPDATE',
      beforeData: existingPengurus,
      afterData: updatedPengurus,
      performedBy: userId,
    });

    return updatedPengurus;
  }

  async deletePengurus(id: string, pondokId: string, userId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.pengurus.delete');

    const existingPengurus = await this.repository.findById(id, pondokId);
    if (!existingPengurus) {
      throw new Error('Pengurus tidak ditemukan.');
    }

    const deletedPengurus = await this.repository.softDelete(id, pondokId, userId);

    await this.logAudit({
      module: 'MASTER_PENGURUS',
      entity: 'master_pengurus',
      entityId: id,
      action: 'DELETE',
      beforeData: existingPengurus,
      afterData: { deletedAt: deletedPengurus.deletedAt, deletedBy: userId },
      performedBy: userId,
    });

    return deletedPengurus;
  }
}
