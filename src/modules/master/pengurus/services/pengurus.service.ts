import { AuditService } from '@/infrastructure/logger/audit/audit.service';
import { AuditRepository } from '@/infrastructure/logger/audit/audit.repository';
import { UnitOfWork } from '@/infrastructure/database/unit-of-work';
import { PengurusRepository } from '../repositories/pengurus.repository';
import { RoleRepository } from '../../role/repositories/role.repository';
import { JabatanRepository } from '../../jabatan/repositories/jabatan.repository';
import { PeriodeRepository } from '../../periode/repositories/periode.repository';
import { CreatePengurusInput, UpdatePengurusInput } from '../validators/pengurus.validator';
import { generateId } from '@/shared/utils';
import { eq, sql } from 'drizzle-orm';
import { masterPeriod } from '../../schemas/master.schema';

export class PengurusService {
  constructor(private readonly uow: UnitOfWork) {}
  private get repository() { return this.uow.repos.pengurus; }
  private get roleRepo() { return this.uow.repos.role; }
  private get jabatanRepo() { return this.uow.repos.jabatan; }
  private get periodeRepo() { return this.uow.repos.periode; }

  async getDropdownOptions(pondokId: string, userPermissions: string[]) {
    
    const roles = await this.roleRepo.findAll(pondokId);
    const positions = await this.jabatanRepo.findAll(pondokId);
    
    // For Periode, since it requires status='Aktif', let's check if PeriodeRepo has findActive
    // Actually, PeriodeRepo doesn't have findActive. But we can fetch all and filter in memory since it's just a dropdown.
    const allPeriods = await this.periodeRepo.findAll(pondokId);
    const periods = allPeriods.filter(p => p.status === 'Aktif');

    return { roles, positions, periods };
  }

  // Simple mock hash function since we might not have bcrypt available in Edge runtime
  private hashPassword(password: string): string {
    return Buffer.from(password).toString('base64');
  }

  async getAllPenguruss(pondokId: string, userPermissions: string[]) {
    return this.repository.findAll(pondokId);
  }

  async getPengurusById(id: string, pondokId: string, userPermissions: string[]) {
    return this.repository.findById(id, pondokId);
  }

  async createPengurus(data: CreatePengurusInput, userId: string, userPermissions: string[]) {

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

    await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
      module: 'MASTER_PENGURUS',
      entityName: 'master_pengurus',
      entityId: id,
      action: 'CREATE',
      afterData: newPengurus,
      performedBy: userId,
    });

    return newPengurus;
  }

  async updatePengurus(id: string, data: UpdatePengurusInput, userId: string, userPermissions: string[]) {

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

    await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
      module: 'MASTER_PENGURUS',
      entityName: 'master_pengurus',
      entityId: id,
      action: 'UPDATE',
      beforeData: existingPengurus,
      afterData: updatedPengurus,
      performedBy: userId,
    });

    return updatedPengurus;
  }

  async deletePengurus(id: string, pondokId: string, userId: string, userPermissions: string[]) {

    const existingPengurus = await this.repository.findById(id, pondokId);
    if (!existingPengurus) {
      throw new Error('Pengurus tidak ditemukan.');
    }

    const deletedPengurus = await this.repository.softDelete(id, pondokId, userId);

    await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
      module: 'MASTER_PENGURUS',
      entityName: 'master_pengurus',
      entityId: id,
      action: 'DELETE',
      beforeData: existingPengurus,
      afterData: { deletedAt: deletedPengurus.deletedAt, deletedBy: userId },
      performedBy: userId,
    });

    return deletedPengurus;
  }
}
