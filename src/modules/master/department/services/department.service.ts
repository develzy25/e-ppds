import { BaseService } from '@/lib/services/base.service';
import { DepartmentRepository } from '../repositories/department.repository';
import { CreateDepartmentInput, UpdateDepartmentInput } from '../validators/department.validator';
import { generateId } from '@/lib/utils';

export class DepartmentService extends BaseService {
  private repository: DepartmentRepository;

  constructor() {
    super();
    this.repository = new DepartmentRepository();
  }

  async getAllDepartments(pondokId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.department.view');
    return this.repository.findAll(pondokId);
  }

  async getDepartmentById(id: string, pondokId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.department.view');
    return this.repository.findById(id, pondokId);
  }

  async createDepartment(data: CreateDepartmentInput, userId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.department.create');

    const existingDepartment = await this.repository.findByName(data.name, data.pondokId);
    if (existingDepartment) {
      throw new Error(`Department dengan nama '${data.name}' sudah ada.`);
    }

    const id = generateId('dept');
    const newDepartment = await this.repository.create({
      ...data,
      id,
      createdBy: userId,
    });

    await this.logAudit({
      module: 'MASTER_DEPARTMENT',
      entity: 'master_department',
      entityId: id,
      action: 'CREATE',
      afterData: newDepartment,
      performedBy: userId,
    });

    return newDepartment;
  }

  async updateDepartment(id: string, data: UpdateDepartmentInput, userId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.department.update');

    const existingDepartment = await this.repository.findById(id, data.pondokId);
    if (!existingDepartment) {
      throw new Error('Department tidak ditemukan.');
    }

    if (existingDepartment.name !== data.name) {
      const nameCheck = await this.repository.findByName(data.name, data.pondokId);
      if (nameCheck) {
        throw new Error(`Department dengan nama '${data.name}' sudah ada.`);
      }
    }

    const updatedDepartment = await this.repository.update(id, {
      ...data,
      updatedBy: userId,
    });

    await this.logAudit({
      module: 'MASTER_DEPARTMENT',
      entity: 'master_department',
      entityId: id,
      action: 'UPDATE',
      beforeData: existingDepartment,
      afterData: updatedDepartment,
      performedBy: userId,
    });

    return updatedDepartment;
  }

  async deleteDepartment(id: string, pondokId: string, userId: string, userPermissions: string[]) {
    this.requirePermission(userPermissions, 'master.department.delete');

    const existingDepartment = await this.repository.findById(id, pondokId);
    if (!existingDepartment) {
      throw new Error('Department tidak ditemukan.');
    }

    // TODO: Cek apakah department sedang digunakan oleh jabatan
    // Jika digunakan, lempar Error

    const deletedDepartment = await this.repository.softDelete(id, pondokId, userId);

    await this.logAudit({
      module: 'MASTER_DEPARTMENT',
      entity: 'master_department',
      entityId: id,
      action: 'DELETE',
      beforeData: existingDepartment,
      afterData: { deletedAt: deletedDepartment.deletedAt, deletedBy: userId },
      performedBy: userId,
    });

    return deletedDepartment;
  }
}
