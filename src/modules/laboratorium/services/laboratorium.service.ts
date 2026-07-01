import { BusinessError, NotFoundError } from '@/infrastructure/errors';
import { UnitOfWork } from '@/lib/database/unit-of-work';
import { RepositoryFactory } from '@/lib/database/repository-factory';
import crypto from 'crypto';
import { eq, sql, and, desc } from 'drizzle-orm';
import { labComputers, labSessions, labTransactions, labTransactionItems } from '../schemas/lab.schema';
import { insertAuditLog } from '@/modules/core/services/audit.service';

export class LaboratoriumService {
  constructor(private readonly uow: UnitOfWork) {}

  /**
   * Starts a billing session
   */
  async startBillingSession(
    computerId: string,
    santriId: string | null,
    tariffId: string,
  ): Promise<string> {
    return await this.uow.execute(async (trx) => {
      const factory = new RepositoryFactory(trx);
      const computerRepo = factory.createLabComputerRepository();
      const tariffRepo = factory.createLabTariffRepository();
      const sessionRepo = factory.createLabSessionRepository();

      const now = new Date().toISOString();

      // Get computer
      const computer = await computerRepo.findById(computerId);
      if (!computer) throw new NotFoundError('Komputer tidak ditemukan');
      if (computer.status !== 'Available') throw new BusinessError('BUSINESS_ERROR', 'Komputer sedang digunakan atau maintenance');

      // Get tariff
      const tariff = await tariffRepo.findById(tariffId);
      if (!tariff) throw new NotFoundError('Tarif tidak ditemukan');

      const sessionId = `session-${crypto.randomBytes(8).toString('hex')}`;

      // Create session
      await sessionRepo.create({
        id: sessionId,
        computerId,
        santriId,
        tariffId,
        startTime: now,
        status: 'Running',
      });

      // Update computer status
      await computerRepo.update(computerId, {
        status: 'In Use',
        updatedAt: now,
      });

      await insertAuditLog({
        module: 'laboratorium',
        entityName: 'lab_sessions',
        entityId: sessionId,
        action: 'CREATE',
        performedBy: santriId || 'SYSTEM',
      });

      return sessionId;
    });
  }

  /**
   * Finishes a billing session and generates a POS transaction
   */
  async finishBillingSession(sessionId: string): Promise<string> {
    return await this.uow.execute(async (trx) => {
      const factory = new RepositoryFactory(trx);
      const sessionRepo = factory.createLabSessionRepository();
      const computerRepo = factory.createLabComputerRepository();
      const transactionRepo = factory.createLabTransactionRepository();
      const tariffRepo = factory.createLabTariffRepository();

      const session = await sessionRepo.findById(sessionId);
      if (!session) throw new NotFoundError('Sesi tidak ditemukan');
      if (session.status !== 'Running') throw new BusinessError('BUSINESS_ERROR', 'Sesi tidak sedang berjalan');

      const now = new Date().toISOString();

      // Calculate total duration in hours (minimum 1 hour for simplicity, or based on minutes)
      const start = new Date(session.startTime).getTime();
      const end = new Date(now).getTime();
      const diffHours = Math.max(1, Math.ceil((end - start) / 3600000));

      const tariff = await tariffRepo.findById(session.tariffId);
      const totalAmount = diffHours * (tariff?.pricePerHour || 0);

      // Update session
      await sessionRepo.update(sessionId, {
        endTime: now,
        status: 'Finished',
        totalCost: totalAmount
      });

      // Release computer
      await computerRepo.update(session.computerId, {
        status: 'Available',
        updatedAt: now,
      });

      // Generate invoice
      const nextIdResult = await this.uow.repos.client.select({ count: sql<number>`count(*)` }).from(labTransactions);
      const nextId = String((nextIdResult[0]?.count || 0) + 1).padStart(5, '0');
      const invoiceNumber = `INV-LAB-${new Date().getFullYear()}-${nextId}`;
      const transactionId = `txn-${crypto.randomBytes(8).toString('hex')}`;

      await transactionRepo.create({
        id: transactionId,
        invoiceNumber,
        sessionId,
        totalAmount,
        status: 'Unpaid',
        createdAt: now,
      });

      await insertAuditLog({
        module: 'laboratorium',
        entityName: 'lab_transactions',
        entityId: transactionId,
        action: 'CREATE',
        performedBy: session.santriId || 'SYSTEM',
      });

      return invoiceNumber;
    });
  }

  /**
   * Menyimpan heartbeat agent dari client PC otomatis (Auto-detect via MAC/Hostname)
   */
  async sendAgentHeartbeat(
    hostname: string,
    macAddress: string,
    status: 'Available' | 'In Use' | 'Maintenance',
    pondokId: string // Used for multitenancy if needed
  ): Promise<string> {
    return await this.uow.execute(async (trx) => {
      const factory = new RepositoryFactory(trx);
      const computerRepo = factory.createLabComputerRepository();
      
      const now = new Date().toISOString();

      // In real scenario we search by MAC. Since labComputers schema only has name and ipAddress, we assume name = hostname
      const computers = await this.uow.repos.client.select().from(labComputers).where(eq(labComputers.name, hostname));
      let computerId = '';

      if (computers.length === 0) {
        computerId = `pc-${crypto.randomBytes(8).toString('hex')}`;
        await computerRepo.create({
          id: computerId,
          name: hostname,
          status,
          ipAddress: macAddress, // reusing this field temporarily since schema lacks macAddress
          createdAt: now,
          updatedAt: now,
        });
      } else {
        computerId = computers[0].id;
        await computerRepo.update(computerId, {
          status: computers[0].status === 'In Use' ? computers[0].status : status,
          updatedAt: now,
        });
      }

      // We'd also insert labAgentLogs here, but the schema doesn't have it yet.
      // So we skip it for now.

      return computerId;
    });
  }

  async pauseBillingSession(sessionId: string): Promise<void> {
    throw new BusinessError('BUSINESS_ERROR', 'Not implemented'); // Schema labSessions missing status 'Paused' and duration field
  }

  async resumeBillingSession(sessionId: string): Promise<void> {
    throw new BusinessError('BUSINESS_ERROR', 'Not implemented'); 
  }

  async handlePowerOutage(pondokId: string): Promise<number> {
    throw new BusinessError('BUSINESS_ERROR', 'Not implemented');
  }
}
