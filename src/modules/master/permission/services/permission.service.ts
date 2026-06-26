import { BaseService } from '@/lib/services/base.service';
import { PermissionRepository } from '../repositories/permission.repository';
import { CreatePermissionInput, UpdatePermissionInput } from '../validators/permission.validator';
import { generateId } from '@/lib/utils';

export class PermissionService extends BaseService {
  private repository: PermissionRepository;

  constructor() {
    super();
    this.repository = new PermissionRepository();
  }

  async getAllPermissions(pondokId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.permission.view');
    return this.repository.findAll(pondokId);
  }

  async getPermissionById(id: string, pondokId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.permission.view');
    return this.repository.findById(id, pondokId);
  }

  async createPermission(data: CreatePermissionInput, userId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.permission.create');

    const existingPermission = await this.repository.findByName(data.name, data.pondokId);
    if (existingPermission) {
      throw new Error(`Permission dengan nama '${data.name}' sudah ada.`);
    }

    const id = generateId('perm');
    const newPermission = await this.repository.create({
      ...data,
      id,
      createdBy: userId,
    });

    await this.logAudit({
      module: 'MASTER_PERMISSION',
      entity: 'master_permission',
      entityId: id,
      action: 'CREATE',
      afterData: newPermission,
      performedBy: userId,
    });

    return newPermission;
  }

  async updatePermission(id: string, data: UpdatePermissionInput, userId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.permission.update');

    const existingPermission = await this.repository.findById(id, data.pondokId);
    if (!existingPermission) {
      throw new Error('Permission tidak ditemukan.');
    }

    if (existingPermission.name !== data.name) {
      const nameCheck = await this.repository.findByName(data.name, data.pondokId);
      if (nameCheck) {
        throw new Error(`Permission dengan nama '${data.name}' sudah ada.`);
      }
    }

    const updatedPermission = await this.repository.update(id, {
      ...data,
      updatedBy: userId,
    });

    await this.logAudit({
      module: 'MASTER_PERMISSION',
      entity: 'master_permission',
      entityId: id,
      action: 'UPDATE',
      beforeData: existingPermission,
      afterData: updatedPermission,
      performedBy: userId,
    });

    return updatedPermission;
  }

  async deletePermission(id: string, pondokId: string, userId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.permission.delete');

    const existingPermission = await this.repository.findById(id, pondokId);
    if (!existingPermission) {
      throw new Error('Permission tidak ditemukan.');
    }

    // TODO: Cek apakah permission sedang digunakan oleh role_permissions (relational check)
    // Jika digunakan, lempar Error

    const deletedPermission = await this.repository.softDelete(id, pondokId, userId);

    await this.logAudit({
      module: 'MASTER_PERMISSION',
      entity: 'master_permission',
      entityId: id,
      action: 'DELETE',
      beforeData: existingPermission,
      afterData: { deletedAt: deletedPermission.deletedAt, deletedBy: userId },
      performedBy: userId,
    });

    return deletedPermission;
  }
}
