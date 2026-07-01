import { AuditService } from '@/infrastructure/logger/audit/audit.service';
import { AuditRepository } from '@/infrastructure/logger/audit/audit.repository';
import { UnitOfWork } from '@/infrastructure/database/unit-of-work';
import { PermissionRepository } from '../repositories/permission.repository';
import { CreatePermissionInput, UpdatePermissionInput } from '../validators/permission.validator';
import { generateId } from '@/shared/utils';
import { ConflictError, NotFoundError } from '@/infrastructure/errors';
import { rolePermissions, masterRole } from '../schemas/master.schema';
import { eq, and, isNull } from 'drizzle-orm';

export class PermissionService {
  constructor(private readonly uow: UnitOfWork) {}
  private get repository() { return this.uow.repos.permission; }

  async getAllPermissions(pondokId: string, userPermissions: string[]) {
    return this.repository.findAll(pondokId);
  }

  async getPermissionById(id: string, pondokId: string, userPermissions: string[]) {
    return this.repository.findById(id, pondokId);
  }

  async createPermission(data: CreatePermissionInput, userId: string, userPermissions: string[]) {

    const existingPermission = await this.repository.findByName(data.name, data.pondokId);
    if (existingPermission) {
      throw new ConflictError(`Permission dengan nama '${data.name}' sudah ada.`);
    }

    const id = generateId('perm');
    const newPermission = await this.repository.create({
      ...data,
      id,
      createdBy: userId,
    });

    await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
      module: 'MASTER_PERMISSION',
      entityName: 'master_permission',
      entityId: id,
      action: 'CREATE',
      afterData: newPermission,
      performedBy: userId,
    });

    return newPermission;
  }

  async updatePermission(id: string, data: UpdatePermissionInput, userId: string, userPermissions: string[]) {

    const existingPermission = await this.repository.findById(id, data.pondokId);
    if (!existingPermission) {
      throw new NotFoundError('Permission tidak ditemukan.');
    }

    if (existingPermission.name !== data.name) {
      const nameCheck = await this.repository.findByName(data.name, data.pondokId);
      if (nameCheck) {
        throw new ConflictError(`Permission dengan nama '${data.name}' sudah ada.`);
      }
    }

    const updatedPermission = await this.repository.update(id, {
      ...data,
      updatedBy: userId,
    });

    await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
      module: 'MASTER_PERMISSION',
      entityName: 'master_permission',
      entityId: id,
      action: 'UPDATE',
      beforeData: existingPermission,
      afterData: updatedPermission,
      performedBy: userId,
    });

    return updatedPermission;
  }

  async deletePermission(id: string, pondokId: string, userId: string, userPermissions: string[]) {

    const existingPermission = await this.repository.findById(id, pondokId);
    if (!existingPermission) {
      throw new NotFoundError('Permission tidak ditemukan.');
    }

    const permissionsExists = await this.uow.repos.client
      .select({ id: rolePermissions.id })
      .from(rolePermissions)
      .innerJoin(masterRole, eq(rolePermissions.roleId, masterRole.id))
      .where(and(eq(rolePermissions.permissionId, id), isNull(masterRole.deletedAt)))
      .limit(1);

    if (permissionsExists.length > 0) {
      await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
        module: 'MASTER_PERMISSION',
        entityName: 'master_permission',
        entityId: id,
        action: 'DELETE_FAILED',
        beforeData: existingPermission,
        afterData: { reason: 'Data masih digunakan oleh entitas Role' },
        performedBy: userId,
      });
      throw new ConflictError('Permission tidak dapat dihapus karena masih digunakan oleh data Role.');
    }

    const deletedPermission = await this.repository.softDelete(id, pondokId, userId);

    await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
      module: 'MASTER_PERMISSION',
      entityName: 'master_permission',
      entityId: id,
      action: 'DELETE',
      beforeData: existingPermission,
      afterData: { deletedAt: deletedPermission.deletedAt, deletedBy: userId },
      performedBy: userId,
    });

    return deletedPermission;
  }
}
