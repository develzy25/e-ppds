import { UnitOfWork } from '@/lib/database/unit-of-work';
import { RepositoryFactory } from '@/lib/database/repository-factory';
import crypto from 'crypto';
import { sql } from 'drizzle-orm';
import { cashBooks, cashMovements, cashDeposits } from '@/modules/laboratorium/schemas/lab.schema';

export class CashService {
  constructor(private readonly uow: UnitOfWork) {}

  /**
   * Catat setoran (Deposit) ke Bendahara
   */
  async recordDepositToTreasurer(
    amount: number,
    info: string,
    user: any,
    periodId: string,
    pondokId: string
  ): Promise<string> {
    return await this.uow.execute(async (repos, trx) => {
      const cashRepo = repos.createCashRepository();
      const depositRepo = repos.createDepositRepository();

      const now = new Date().toISOString();
      const dateStr = now.substring(0, 10);

      const cashBook = await cashRepo.getCashBookByDate(dateStr, pondokId, periodId);
      if (!cashBook) throw new Error('Buku kas hari ini belum ada');
      if (cashBook.kasAkhir < amount) throw new Error('Saldo kas tidak mencukupi untuk disetor');

      // Update cash book
      await cashRepo.update(cashBook.id, {
          pengeluaran: cashBook.pengeluaran + amount,
          kasAkhir: cashBook.kasAkhir - amount,
      });

      // Record deposit
      const depositId = `dep-${crypto.randomBytes(8).toString('hex')}`;
      await depositRepo.insert({
        id: depositId,
        date: dateStr,
        totalPemasukan: cashBook.kasAkhir,
        jumlahDisetor: amount,
        saldoOperasional: cashBook.kasAkhir - amount,
        keterangan: info,
        verifiedBy: user.id,
        periodId,
        pondokId,
      });

      // Record movement
      await trx.insert(cashMovements).values({
        id: `mov-${crypto.randomBytes(8).toString('hex')}`,
        date: dateStr,
        type: 'Kredit',
        amount,
        description: `Setoran ke Bendahara: ${info}`,
        periodId,
        pondokId,
      });

      return depositId;
    });
  }

  /**
   * Catat pengeluaran operasional
   */
  async recordExpense(
    amount: number,
    info: string,
    user: any,
    periodId: string,
    pondokId: string
  ): Promise<string> {
    return await this.uow.execute(async (repos, trx) => {
      const cashRepo = repos.createCashRepository();

      const now = new Date().toISOString();
      const dateStr = now.substring(0, 10);

      const cashBook = await cashRepo.getCashBookByDate(dateStr, pondokId, periodId);
      if (!cashBook) throw new Error('Buku kas hari ini belum ada');
      if (cashBook.kasAkhir < amount) throw new Error('Saldo kas tidak mencukupi');

      // Update cash book
      await cashRepo.update(cashBook.id, {
          pengeluaran: cashBook.pengeluaran + amount,
          kasAkhir: cashBook.kasAkhir - amount,
      });

      // Record movement
      const movementId = `mov-${crypto.randomBytes(8).toString('hex')}`;
      await trx.insert(cashMovements).values({
        id: movementId,
        date: dateStr,
        type: 'Kredit',
        amount,
        description: `Pengeluaran Operasional: ${info}`,
        periodId,
        pondokId,
      });

      return movementId;
    });
  }

  /**
   * Generate Laporan Buku Kas Harian
   */
  async generateCashBookReport(date: string, pondokId: string) {
    return await this.uow.execute(async (repos, trx) => {
      const cashRepo = repos.createCashRepository();

      // Implementasi sederhananya mengambil dari cashBook untuk tanggal tersebut
      const cashBook = await cashRepo.databaseClient
        .select()
        .from(cashRepo['table'])
        .where(sql`${cashRepo['table'].date} = ${date} AND ${cashRepo['table'].pondokId} = ${pondokId}`)
        .then((res: any[]) => res[0]);

      if (!cashBook) {
        return {
          date,
          pemasukan: 0,
          pengeluaran: 0,
          saldoAkhir: 0,
          movements: []
        };
      }

      const movements = await trx.select().from(cashMovements).where(
        sql`${cashMovements.date} = ${date} AND ${cashMovements.pondokId} = ${pondokId}`
      );

      return {
        date,
        pemasukan: cashBook.pemasukanBilling + cashBook.pemasukanJasa,
        pengeluaran: cashBook.pengeluaran,
        saldoAkhir: cashBook.kasAkhir,
        movements,
      };
    });
  }
}
