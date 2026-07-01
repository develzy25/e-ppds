import { db } from '@/db';
import { DbClient } from './repositories/base.repository';

// Master Repositories
import { BlokRepository } from '@/modules/master/repositories/blok.repository';
import { DepartmentRepository } from '@/modules/master/repositories/department.repository';
import { JabatanRepository } from '@/modules/master/repositories/jabatan.repository';
import { KamarRepository } from '@/modules/master/repositories/kamar.repository';
import { KelasRepository } from '@/modules/master/repositories/kelas.repository';
import { PengurusRepository } from '@/modules/master/repositories/pengurus.repository';
import { PeriodeRepository } from '@/modules/master/repositories/periode.repository';
import { PermissionRepository } from '@/modules/master/repositories/permission.repository';
import { RoleRepository } from '@/modules/master/repositories/role.repository';
import { SantriRepository } from '@/modules/master/repositories/santri.repository';
import { SekolahRepository } from '@/modules/master/repositories/sekolah.repository';
import { TahunAjaranRepository } from '@/modules/master/repositories/tahun-ajaran.repository';

// Lab Repositories
import { LabComputerRepository } from '@/modules/laboratorium/repositories/lab-computer.repository';
import { LabTariffRepository } from '@/modules/laboratorium/repositories/lab-tariff.repository';
import { LabSessionRepository } from '@/modules/laboratorium/repositories/lab-session.repository';
import { LabServiceRepository } from '@/modules/laboratorium/repositories/lab-service.repository';
import { LabInventoryRepository } from '@/modules/laboratorium/repositories/lab-inventory.repository';
import { LabTransactionRepository } from '@/modules/laboratorium/repositories/lab-transaction.repository';
import { LabTransactionItemRepository } from '@/modules/laboratorium/repositories/lab-transaction-item.repository';

// POS Repositories
import { PosTransactionRepository } from '@/modules/pos/repositories/pos-transaction.repository';
import { PosTransactionItemRepository } from '@/modules/pos/repositories/pos-transaction-item.repository';
import { PosPaymentRepository } from '@/modules/pos/repositories/pos-payment.repository';
import { PosProductRepository } from '@/modules/pos/repositories/pos-product.repository';
import { PosStockRepository } from '@/modules/pos/repositories/pos-stock.repository';

// Cash Repositories
import { CashRepository } from '@/modules/keuangan/repositories/cash.repository';
import { DepositRepository } from '@/modules/laboratorium/repositories/deposit.repository';

// Keuangan Repositories
import { JenisTagihanRepository } from '@/modules/keuangan/repositories/jenis-tagihan.repository';
import { TarifRepository } from '@/modules/keuangan/repositories/tarif.repository';

/**
 * RepositoryFactory
 * 
 * Factory class to centralize the creation of all repositories.
 * Extremely useful when executing operations within a UnitOfWork transaction (trx),
 * ensuring all repositories share the same transaction context.
 */
export class RepositoryFactory {
  constructor(private readonly dbClient?: DbClient) {}

  get client(): DbClient {
    return this.dbClient || db;
  }

  // ==============================================================
  // GETTERS (Enterprise Shortcut Pattern)
  // ==============================================================
  get blok() { return this.createBlokRepository(); }
  get department() { return this.createDepartmentRepository(); }
  get jabatan() { return this.createJabatanRepository(); }
  get kamar() { return this.createKamarRepository(); }
  get kelas() { return this.createKelasRepository(); }
  get pengurus() { return this.createPengurusRepository(); }
  get periode() { return this.createPeriodeRepository(); }
  get permission() { return this.createPermissionRepository(); }
  get role() { return this.createRoleRepository(); }
  get santri() { return this.createSantriRepository(); }
  get sekolah() { return this.createSekolahRepository(); }
  get tahunAjaran() { return this.createTahunAjaranRepository(); }

  // ==============================================================
  // MASTER REPOSITORIES
  // ==============================================================

  createBlokRepository(): BlokRepository {
    return new BlokRepository(this.dbClient);
  }

  createDepartmentRepository(): DepartmentRepository {
    return new DepartmentRepository(this.dbClient);
  }

  createJabatanRepository(): JabatanRepository {
    return new JabatanRepository(this.dbClient);
  }

  createKamarRepository(): KamarRepository {
    return new KamarRepository(this.dbClient);
  }

  createKelasRepository(): KelasRepository {
    return new KelasRepository(this.dbClient);
  }

  createPengurusRepository(): PengurusRepository {
    return new PengurusRepository(this.dbClient);
  }

  createPeriodeRepository(): PeriodeRepository {
    return new PeriodeRepository(this.dbClient);
  }

  createPermissionRepository(): PermissionRepository {
    return new PermissionRepository(this.dbClient);
  }

  createRoleRepository(): RoleRepository {
    return new RoleRepository(this.dbClient);
  }

  createSantriRepository(): SantriRepository {
    return new SantriRepository(this.dbClient);
  }

  createSekolahRepository(): SekolahRepository {
    return new SekolahRepository(this.dbClient);
  }

  createTahunAjaranRepository(): TahunAjaranRepository {
    return new TahunAjaranRepository(this.dbClient);
  }

  // ==============================================================
  // LABORATORIUM REPOSITORIES (Phase 4.1)
  // ==============================================================

  createLabComputerRepository(): LabComputerRepository {
    return new LabComputerRepository(this.dbClient);
  }

  createLabTariffRepository(): LabTariffRepository {
    return new LabTariffRepository(this.dbClient);
  }

  createLabSessionRepository(): LabSessionRepository {
    return new LabSessionRepository(this.dbClient);
  }

  createLabServiceRepository(): LabServiceRepository {
    return new LabServiceRepository(this.dbClient);
  }

  createLabInventoryRepository(): LabInventoryRepository {
    return new LabInventoryRepository(this.dbClient);
  }

  createLabTransactionRepository(): LabTransactionRepository {
    return new LabTransactionRepository(this.dbClient);
  }

  createLabTransactionItemRepository(): LabTransactionItemRepository {
    return new LabTransactionItemRepository(this.dbClient);
  }

  // ==============================================================
  // POS REPOSITORIES (To Be Added in Phase 4.2)
  // ==============================================================
  createPosTransactionRepository(): PosTransactionRepository {
    return new PosTransactionRepository(this.dbClient);
  }
  createPosTransactionItemRepository(): PosTransactionItemRepository {
    return new PosTransactionItemRepository(this.dbClient);
  }
  createPosPaymentRepository(): PosPaymentRepository {
    return new PosPaymentRepository(this.dbClient);
  }
  createPosProductRepository(): PosProductRepository {
    return new PosProductRepository(this.dbClient);
  }
  createPosStockRepository(): PosStockRepository {
    return new PosStockRepository(this.dbClient);
  }

  // ==============================================================
  // KEUANGAN REPOSITORIES (To Be Added in Phase 4.3)
  // ==============================================================
  createJenisTagihanRepository(): JenisTagihanRepository {
    return new JenisTagihanRepository(this.dbClient);
  }
  createTarifRepository(): TarifRepository {
    return new TarifRepository(this.dbClient);
  }
  createCashRepository(): CashRepository {
    return new CashRepository(this.dbClient);
  }
  createDepositRepository(): DepositRepository {
    return new DepositRepository(this.dbClient);
  }

  // ==============================================================
  // BILLING REPOSITORIES (To Be Added in Phase 4.4)
  // ==============================================================

  // ==============================================================
  // KEAAMANAN REPOSITORIES
  // ==============================================================
  createKeamananPermitRepository() {
    // Lazy loaded to avoid circular dependencies if any, but since they are small, we can import them.
    const { KeamananPermitRepository } = require('@/modules/keamanan/repositories/keamanan.repository');
    return new KeamananPermitRepository(this.dbClient as any);
  }

  createKeamananOffenseRepository() {
    const { KeamananOffenseRepository } = require('@/modules/keamanan/repositories/keamanan.repository');
    return new KeamananOffenseRepository(this.dbClient as any);
  }
}

