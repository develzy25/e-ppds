import { AuditService } from '@/infrastructure/logger/audit/audit.service';
import { AuditRepository } from '@/infrastructure/logger/audit/audit.repository';
import { UnitOfWork } from '@/infrastructure/database/unit-of-work';
import { RoleRepository } from '../repositories/role.repository';
import { CreateRoleInput, UpdateRoleInput } from '../validators/role.validator';
import { generateId } from '@/shared/utils';
import { ConflictError, NotFoundError } from '@/lib/errors';
import { pengurusRoles, masterPengurus } from '../../schemas/master.schema';
import { eq, and, isNull } from 'drizzle-orm';

export class RoleService {
  constructor(private readonly uow: UnitOfWork) {}
  private get repository() { return this.uow.repos.role; }

  async getAllRoles(pondokId: string, userPermissions: string[]) {
    return this.repository.findAll(pondokId);
  }

  async getRoleById(id: string, pondokId: string, userPermissions: string[]) {
    return this.repository.findById(id, pondokId);
  }

  async createRole(data: CreateRoleInput, userId: string, userPermissions: string[]) {

    const existingRole = await this.repository.findByName(data.name, data.pondokId);
    if (existingRole) {
      throw new ConflictError(`Role dengan nama '${data.name}' sudah ada.`);
    }

    const id = generateId('role');
    const newRole = await this.repository.create({
      ...data,
      id,
      createdBy: userId,
    });

    await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
      module: 'MASTER_ROLE',
      entityName: 'master_role',
      entityId: id,
      action: 'CREATE',
      afterData: newRole,
      performedBy: userId,
    });

    return newRole;
  }

  async updateRole(id: string, data: UpdateRoleInput, userId: string, userPermissions: string[]) {

    const existingRole = await this.repository.findById(id, data.pondokId);
    if (!existingRole) {
      throw new NotFoundError('Role tidak ditemukan.');
    }

    if (existingRole.name !== data.name) {
      const nameCheck = await this.repository.findByName(data.name, data.pondokId);
      if (nameCheck) {
        throw new ConflictError(`Role dengan nama '${data.name}' sudah ada.`);
      }
    }

    const updatedRole = await this.repository.update(id, {
      ...data,
      updatedBy: userId,
    });

    await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
      module: 'MASTER_ROLE',
      entityName: 'master_role',
      entityId: id,
      action: 'UPDATE',
      beforeData: existingRole,
      afterData: updatedRole,
      performedBy: userId,
    });

    return updatedRole;
  }

  async deleteRole(id: string, pondokId: string, userId: string, userPermissions: string[]) {

    const existingRole = await this.repository.findById(id, pondokId);
    if (!existingRole) {
      throw new NotFoundError('Role tidak ditemukan.');
    }

    const rolesExists = await this.uow.repos.client
      .select({ id: pengurusRoles.id })
      .from(pengurusRoles)
      .innerJoin(masterPengurus, eq(pengurusRoles.pengurusId, masterPengurus.id))
      .where(and(eq(pengurusRoles.roleId, id), isNull(masterPengurus.deletedAt)))
      .limit(1);

    if (rolesExists.length > 0) {
      await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
        module: 'MASTER_ROLE',
        entityName: 'master_role',
        entityId: id,
        action: 'DELETE_FAILED',
        beforeData: existingRole,
        afterData: { reason: 'Data masih digunakan oleh entitas Pengurus (Role aktif)' },
        performedBy: userId,
      });
      throw new ConflictError('Role tidak dapat dihapus karena masih digunakan oleh data Pengurus.');
    }

    const deletedRole = await this.repository.softDelete(id, pondokId, userId);

    await new AuditService(new AuditRepository(this.uow.repos.client)).writeAuditLog({
      module: 'MASTER_ROLE',
      entityName: 'master_role',
      entityId: id,
      action: 'DELETE',
      beforeData: existingRole,
      afterData: { deletedAt: deletedRole.deletedAt, deletedBy: userId },
      performedBy: userId,
    });

    return deletedRole;
  }
}
