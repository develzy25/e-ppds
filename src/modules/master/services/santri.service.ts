import { BusinessError, ConflictError } from '@/infrastructure/errors';
import { AuditService } from '@/infrastructure/logger/audit/audit.service';
import { AuditRepository } from '@/infrastructure/logger/audit/audit.repository';
import { UnitOfWork } from '@/infrastructure/database/unit-of-work';
import { CreateSantriInput, UpdateSantriInput } from '../validators/santri.validator';
import { generateId } from '@/shared/utils';

export class SantriService {
  constructor(private readonly uow: UnitOfWork) {}
  private get repository() { return this.uow.repos.santri; }
  private get kamarRepo() { return this.uow.repos.kamar; }
  private get kelasRepo() { return this.uow.repos.kelas; }
  private get tahunAjaranRepo() { return this.uow.repos.tahunAjaran; }

  async getDropdownOptions(pondokId: string, userPermissions: string[]) {
    // Permission check if needed
    const kamars = await this.kamarRepo.findAll(pondokId);
    const classes = await this.kelasRepo.findAll(pondokId);
    const allAcademicYears = await this.tahunAjaranRepo.findAll(pondokId);
    const academicYears = allAcademicYears.filter(a => a.status === 'Aktif');

    return { kamars, classes, academicYears };
  }

  async getAllSantris(pondokId: string, userPermissions: string[], page: number = 1, limit: number = 20, filters?: Record<string, any>) {
    return this.repository.findAllPaginated(pondokId, page, limit, filters);
  }

  async getSantriById(id: string, pondokId: string, userPermissions: string[]) {
    return this.repository.findById(id, pondokId);
  }

  async createSantri(data: CreateSantriInput, userId: string, userPermissions: string[]) {
    const existingSantri = await this.repository.findByNis(data.nis, data.pondokId);
    if (existingSantri) {
      throw new ConflictError(`NIS '${data.nis}' sudah digunakan oleh santri lain.`);
    }

    const id = generateId('santri');
    // Fallback sync for name/fullName
    const nameToSave = data.fullName || data.name || 'Santri Tanpa Nama';
    const fullNameToSave = data.fullName || data.name || 'Santri Tanpa Nama';
    
    const newSantri = await this.repository.create({
      name: nameToSave,
      fullName: fullNameToSave,
      ...data,
      id,
      createdBy: userId,
    });

    const auditService = new AuditService(new AuditRepository(this.uow.repos.client));
    await auditService.writeAuditLog({
      module: 'master',
      action: 'CREATE',
      entityName: 'santri',
      entityId: id,
      performedBy: userId,
      afterData: newSantri,
    });

    return newSantri;
  }

  async updateSantri(id: string, data: UpdateSantriInput, userId: string, userPermissions: string[]) {
    if (data.nis) {
      const existingSantri = await this.repository.findByNis(data.nis, data.pondokId);
      if (existingSantri && existingSantri.id !== id) {
        throw new ConflictError(`NIS '${data.nis}' sudah digunakan oleh santri lain.`);
      }
    }

    const oldSantri = await this.repository.findById(id, data.pondokId);
    
    // Fallback sync
    const syncData: any = {};
    if (data.fullName || data.name) {
      syncData.name = data.fullName || data.name;
      syncData.fullName = data.fullName || data.name;
    }
    
    const updatedSantri = await this.repository.update(id, data.pondokId, {
      ...data,
      ...syncData,
      updatedBy: userId,
    });

    const auditService = new AuditService(new AuditRepository(this.uow.repos.client));
    await auditService.writeAuditLog({
      module: 'master',
      action: 'UPDATE',
      entityName: 'santri',
      entityId: id,
      performedBy: userId,
      beforeData: oldSantri,
      afterData: updatedSantri,
    });

    return updatedSantri;
  }

  async deleteSantri(id: string, pondokId: string, userId: string, userPermissions: string[]) {
    const santri = await this.repository.findById(id, pondokId);
    await this.repository.softDelete(id, pondokId, userId);

    const auditService = new AuditService(new AuditRepository(this.uow.repos.client));
    await auditService.writeAuditLog({
      module: 'master',
      action: 'DELETE',
      entityName: 'santri',
      entityId: id,
      performedBy: userId,
      beforeData: santri,
    });

    return true;
  }

  async importSantriBulk(data: any[], userId: string, pondokId: string) {
    const rooms = await this.kamarRepo.findAll(pondokId);
    const roomMap = new Map(rooms.map(r => [r.name.toLowerCase().trim(), r.id]));
    
    const classes = await this.kelasRepo.findAll(pondokId);
    const classMap = new Map(classes.map(c => [c.name.toLowerCase().trim(), c.id]));
    
    const academicYears = await this.tahunAjaranRepo.findAll(pondokId);
    const academicYearMap = new Map(academicYears.map(a => [a.name.toLowerCase().trim(), a.id]));
    const activeYear = academicYears.find(a => a.status === 'Aktif')?.id || academicYears[0]?.id || 'default-period';

    const results = {
      successCount: 0,
      failedCount: 0,
      errors: [] as { row: number; name: string; error: string }[]
    };

    await this.uow.execute(async (repos) => {
      const santriRepo = repos.createSantriRepository();
      
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowNum = i + 2; 
        
        try {
          if (!row.nis) {
            throw new BusinessError('BUSINESS_ERROR', 'NIS tidak boleh kosong');
          }
          if (!row.fullName) {
            throw new BusinessError('BUSINESS_ERROR', 'Nama Lengkap tidak boleh kosong');
          }
          if (!row.gender || !['L', 'P'].includes(row.gender.toUpperCase())) {
            throw new BusinessError('BUSINESS_ERROR', 'Jenis Kelamin harus L atau P');
          }

          const existing = await santriRepo.findByNis(row.nis, pondokId);
          if (existing) {
            throw new ConflictError(`NIS '${row.nis}' sudah digunakan oleh santri lain`);
          }

          const roomId = row.roomName ? (roomMap.get(row.roomName.toLowerCase().trim()) || null) : null;
          const classFormalId = row.classFormalName ? (classMap.get(row.classFormalName.toLowerCase().trim()) || null) : null;
          const classDiniyahId = row.classDiniyahName ? (classMap.get(row.classDiniyahName.toLowerCase().trim()) || null) : null;
          const academicYearId = row.academicYearName ? (academicYearMap.get(row.academicYearName.toLowerCase().trim()) || activeYear) : activeYear;

          const santriId = generateId('santri');
          
          await santriRepo.create({
            ...row,
            id: santriId,
            roomId,
            classFormalId,
            classDiniyahId,
            academicYearId,
            pondokId,
            createdBy: userId,
          });

          results.successCount++;
        } catch (err: any) {
          results.failedCount++;
          results.errors.push({
            row: rowNum,
            name: row.fullName || row.nis || `Baris ${rowNum}`,
            error: err.message || 'Error tidak diketahui'
          });
        }
      }

      if (results.successCount > 0) {
        const auditService = new AuditService(new AuditRepository(repos.client));
        await auditService.writeAuditLog({
          module: 'master',
          action: 'IMPORT',
          entityName: 'santri',
          entityId: `bulk-import-${Date.now()}`,
          performedBy: userId,
          afterData: {
            message: `Bulk import santri: ${results.successCount} sukses, ${results.failedCount} gagal.`,
            importedCount: results.successCount
          }
        });
      }
    });

    return results;
  }
}
