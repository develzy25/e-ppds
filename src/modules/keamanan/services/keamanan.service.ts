import { UnitOfWork } from '@/infrastructure/database/unit-of-work';
import { RepositoryFactory } from '@/infrastructure/database/repository-factory';
import { requirePermission } from '@/modules/core/services/rbac.service';
import { insertAuditLog } from '@/modules/core/services/audit.service';
import { BusinessError, NotFoundError } from '@/infrastructure/errors';
import crypto from 'crypto';

export class KeamananService {
  constructor(private uow: UnitOfWork) {}

  async getPermits(pondokId: string, userPermissions: string[]) {
    requirePermission(userPermissions, 'keamanan.dashboard.view');
    return this.uow.execute(async (trx) => {
      const factory = new RepositoryFactory(trx);
      const repo = factory.createKeamananPermitRepository();
      return await repo.findAllWithSantri();
    });
  }

  async getOffenses(pondokId: string, userPermissions: string[]) {
    requirePermission(userPermissions, 'keamanan.dashboard.view');
    return this.uow.execute(async (trx) => {
      const factory = new RepositoryFactory(trx);
      const repo = factory.createKeamananOffenseRepository();
      return await repo.findAllWithSantri();
    });
  }

  async createPermit(input: {
    santriId: string;
    type: string;
    startDate: string;
    endDate: string;
    notes?: string;
  }, pondokId: string, userPermissions: string[], userId: string) {
    requirePermission(userPermissions, 'keamanan.dashboard.view'); // You can adjust precise permission string if needed
    
    return this.uow.execute(async (trx) => {
      const factory = new RepositoryFactory(trx);
      const repo = factory.createKeamananPermitRepository();
      const santriRepo = factory.createSantriRepository();

      const santri = await santriRepo.findById(input.santriId, pondokId);
      if (!santri) throw new NotFoundError('Santri tidak ditemukan');

      const newId = `permit-${crypto.randomBytes(8).toString('hex')}`;
      
      const newPermit = await repo.create({
        id: newId,
        santriId: input.santriId,
        type: input.type,
        startDate: input.startDate,
        endDate: input.endDate,
        notes: input.notes,
        status: 'Draft',
        createdBy: userId,
      });

      await insertAuditLog({
        module: 'keamanan',
        entityName: 'keamanan_permits',
        entityId: newId,
        action: 'CREATE',
        performedBy: userId,
      });

      return newPermit;
    });
  }

  async approvePermit(permitId: string, pondokId: string, userPermissions: string[], userId: string) {
    requirePermission(userPermissions, 'keamanan.dashboard.view');
    return this.uow.execute(async (trx) => {
      const factory = new RepositoryFactory(trx);
      const repo = factory.createKeamananPermitRepository();
      
      const permit = await repo.findById(permitId, pondokId);
      if (!permit) throw new NotFoundError('Izin tidak ditemukan');
      if (permit.status === 'Disetujui') throw new BusinessError('BUSINESS_ERROR', 'Izin sudah disetujui sebelumnya');

      const updated = await repo.update(permitId, {
        status: 'Disetujui',
        updatedBy: userId,
      });

      await insertAuditLog({
        module: 'keamanan',
        entityName: 'keamanan_permits',
        entityId: permitId,
        action: 'APPROVE',
        performedBy: userId,
      });

      return updated;
    });
  }

  async addOffense(input: {
    santriId: string;
    category: string;
    description: string;
    points: number;
    handlerName: string;
  }, pondokId: string, userPermissions: string[], userId: string) {
    requirePermission(userPermissions, 'keamanan.dashboard.view');
    return this.uow.execute(async (trx) => {
      const factory = new RepositoryFactory(trx);
      const repo = factory.createKeamananOffenseRepository();
      const santriRepo = factory.createSantriRepository();
      
      const santri = await santriRepo.findById(input.santriId, pondokId);
      if (!santri) throw new NotFoundError('Santri tidak ditemukan');

      const newId = `offense-${crypto.randomBytes(8).toString('hex')}`;
      
      const newOffense = await repo.create({
        id: newId,
        santriId: input.santriId,
        category: input.category,
        description: input.description,
        points: input.points,
        date: new Date().toISOString(),
        handlerName: input.handlerName,
        createdBy: userId,
      });

      await insertAuditLog({
        module: 'keamanan',
        entityName: 'keamanan_offenses',
        entityId: newId,
        action: 'CREATE',
        performedBy: userId,
      });

      return newOffense;
    });
  }
}
