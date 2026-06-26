import { BaseService } from '@/lib/services/base.service';
import { RoleRepository } from '../repositories/role.repository';
import { CreateRoleInput, UpdateRoleInput } from '../validators/role.validator';
import { generateId } from '@/lib/utils';

export class RoleService extends BaseService {
  private repository: RoleRepository;

  constructor() {
    super();
    this.repository = new RoleRepository();
  }

  async getAllRoles(pondokId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.role.view');
    return this.repository.findAll(pondokId);
  }

  async getRoleById(id: string, pondokId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.role.view');
    return this.repository.findById(id, pondokId);
  }

  async createRole(data: CreateRoleInput, userId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.role.create');

    const existingRole = await this.repository.findByName(data.name, data.pondokId);
    if (existingRole) {
      throw new Error(`Role dengan nama '${data.name}' sudah ada.`);
    }

    const id = generateId('role');
    const newRole = await this.repository.create({
      ...data,
      id,
      createdBy: userId,
    });

    await this.logAudit({
      module: 'MASTER_ROLE',
      entity: 'master_role',
      entityId: id,
      action: 'CREATE',
      afterData: newRole,
      performedBy: userId,
    });

    return newRole;
  }

  async updateRole(id: string, data: UpdateRoleInput, userId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.role.update');

    const existingRole = await this.repository.findById(id, data.pondokId);
    if (!existingRole) {
      throw new Error('Role tidak ditemukan.');
    }

    if (existingRole.name !== data.name) {
      const nameCheck = await this.repository.findByName(data.name, data.pondokId);
      if (nameCheck) {
        throw new Error(`Role dengan nama '${data.name}' sudah ada.`);
      }
    }

    const updatedRole = await this.repository.update(id, {
      ...data,
      updatedBy: userId,
    });

    await this.logAudit({
      module: 'MASTER_ROLE',
      entity: 'master_role',
      entityId: id,
      action: 'UPDATE',
      beforeData: existingRole,
      afterData: updatedRole,
      performedBy: userId,
    });

    return updatedRole;
  }

  async deleteRole(id: string, pondokId: string, userId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.role.delete');

    const existingRole = await this.repository.findById(id, pondokId);
    if (!existingRole) {
      throw new Error('Role tidak ditemukan.');
    }

    // TODO: Cek apakah role sedang digunakan oleh pengurus_roles (relational check)
    // Jika digunakan, lempar Error

    const deletedRole = await this.repository.softDelete(id, pondokId, userId);

    await this.logAudit({
      module: 'MASTER_ROLE',
      entity: 'master_role',
      entityId: id,
      action: 'DELETE',
      beforeData: existingRole,
      afterData: { deletedAt: deletedRole.deletedAt, deletedBy: userId },
      performedBy: userId,
    });

    return deletedRole;
  }
}
