import { AuditService } from '@/infrastructure/logger/audit/audit.service';
import { AuditRepository } from '@/infrastructure/logger/audit/audit.repository';
import { UnitOfWork } from '@/infrastructure/database/unit-of-work';
import { DepartmentRepository } from '../repositories/department.repository';
import { CreateDepartmentInput, UpdateDepartmentInput } from '../validators/department.validator';
import { generateId } from '@/shared/utils';
import { ConflictError, NotFoundError } from '@/lib/errors';
import { masterPosition } from '../../schemas/master.schema';
import { eq, and, isNull } from 'drizzle-orm';

export class DepartmentService {
  constructor(private readonly uow: UnitOfWork) {}
  private get repository() { return this.uow.repos.department; }

  async getAllDepartments(pondokId: string, userPermissions: string[]) {
    return this.repository.findAll(pondokId);
  }

  async getDepartmentById(id: string, pondokId: string, userPermissions: string[]) {
    return this.repository.findById(id, pondokId);
  }

  async createDepartment(data: CreateDepartmentInput, userId: string, userPermissions: string[]) {

    const existingDepartment = await this.repository.findByName(data.name, data.pondokId);
    if (existingDepartment) {
      throw new ConflictError(`Department dengan nama '${data.name}' sudah ada.`);
    }

    const id = generateId('dept');
    const newDepartment = await this.repository.create({
      ...data,
      id,
      createdBy: userId,
    });

    await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
      module: 'MASTER_DEPARTMENT',
      entityName: 'master_department',
      entityId: id,
      action: 'CREATE',
      afterData: newDepartment,
      performedBy: userId,
    });

    return newDepartment;
  }

  async updateDepartment(id: string, data: UpdateDepartmentInput, userId: string, userPermissions: string[]) {

    const existingDepartment = await this.repository.findById(id, data.pondokId);
    if (!existingDepartment) {
      throw new NotFoundError('Department tidak ditemukan.');
    }

    if (existingDepartment.name !== data.name) {
      const nameCheck = await this.repository.findByName(data.name, data.pondokId);
      if (nameCheck) {
        throw new ConflictError(`Department dengan nama '${data.name}' sudah ada.`);
      }
    }

    const updatedDepartment = await this.repository.update(id, {
      ...data,
      updatedBy: userId,
    });

    await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
      module: 'MASTER_DEPARTMENT',
      entityName: 'master_department',
      entityId: id,
      action: 'UPDATE',
      beforeData: existingDepartment,
      afterData: updatedDepartment,
      performedBy: userId,
    });

    return updatedDepartment;
  }

  async deleteDepartment(id: string, pondokId: string, userId: string, userPermissions: string[]) {

    const existingDepartment = await this.repository.findById(id, pondokId);
    if (!existingDepartment) {
      throw new NotFoundError('Department tidak ditemukan.');
    }

    const positionExists = await this.uow.repos.client
      .select({ id: masterPosition.id })
      .from(masterPosition)
      .where(and(eq(masterPosition.departmentId, id), isNull(masterPosition.deletedAt)))
      .limit(1);

    if (positionExists.length > 0) {
      await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
        module: 'MASTER_DEPARTMENT',
        entityName: 'master_department',
        entityId: id,
        action: 'DELETE_FAILED',
        beforeData: existingDepartment,
        afterData: { reason: 'Data masih digunakan oleh entitas Jabatan' },
        performedBy: userId,
      });
      throw new ConflictError('Department tidak dapat dihapus karena masih digunakan oleh data Jabatan.');
    }

    const deletedDepartment = await this.repository.softDelete(id, pondokId, userId);

    await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
      module: 'MASTER_DEPARTMENT',
      entityName: 'master_department',
      entityId: id,
      action: 'DELETE',
      beforeData: existingDepartment,
      afterData: { deletedAt: deletedDepartment.deletedAt, deletedBy: userId },
      performedBy: userId,
    });

    return deletedDepartment;
  }
}
