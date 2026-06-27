import { UnitOfWork } from '@/lib/database/unit-of-work';
import { RepositoryFactory } from '@/lib/database/repository-factory';
import crypto from 'crypto';
import { sql } from 'drizzle-orm';
import { posTransactions } from '@/modules/laboratorium/schemas/lab.schema';

export class PosService {
  constructor(private readonly uow: UnitOfWork) {}

  /**
   * Creates a new POS transaction for items (e.g. Lab Services)
   */
  async createTransaction(
    items: { serviceRateId: string; qty: number }[],
    cashierName: string,
    periodId: string,
    pondokId: string,
    transactionType: string = 'Jasa Laboratorium'
  ): Promise<string> {
    return await this.uow.execute(async (repos, trx) => {
      const transactionRepo = repos.createPosTransactionRepository();
      const itemRepo = repos.createPosTransactionItemRepository();
      const productRepo = repos.createPosProductRepository();

      const now = new Date().toISOString();
      let totalAmount = 0;
      const itemsWithPrice = [];

      for (const item of items) {
        // Here we use productRepo which points to labServices currently
        const rate = await productRepo.findById(item.serviceRateId);

        if (!rate) throw new Error(`Product/Service rate id ${item.serviceRateId} tidak ditemukan`);

        const price = rate.price || rate.harga || 0;
        const subtotal = price * item.qty;
        totalAmount += subtotal;

        itemsWithPrice.push({
          id: `item-${crypto.randomBytes(8).toString('hex')}`,
          serviceRateId: item.serviceRateId,
          qty: item.qty,
          priceAtSale: price,
        });
      }

      // Generate Invoice Number
      const nextPosNumRes = await trx.select({ count: sql<number>`COUNT(*)` }).from(posTransactions);
      const nextPosNum = String(Number(nextPosNumRes[0]?.count || 0) + 1).padStart(5, '0');
      const transactionId = `POS-${new Date().getFullYear()}-${nextPosNum}`;

      await transactionRepo.insert({
        id: transactionId,
        transactionType,
        totalAmount,
        status: 'Menunggu Pembayaran',
        cashierName,
        periodId,
        pondokId,
        createdAt: now,
      });

      for (const item of itemsWithPrice) {
        await itemRepo.insert({
          ...item,
          transactionId,
        });
      }

      return transactionId;
    });
  }

  /**
   * Pays a POS transaction
   */
  async payTransaction(
    transactionId: string,
    paymentMethod: 'Tunai' | 'Transfer' | 'QRIS',
    amountPaid: number,
    cashierName: string,
    periodId: string,
    pondokId: string
  ): Promise<{ success: boolean; change: number }> {
    return await this.uow.execute(async (repos, trx) => {
      const transactionRepo = repos.createPosTransactionRepository();
      const paymentRepo = repos.createPosPaymentRepository();
      // Need cash book to record revenue
      const cashRepo = repos.createCashRepository();

      const transaction = await transactionRepo.findById(transactionId);

      if (!transaction) throw new Error('Transaksi tidak ditemukan');
      if (transaction.status === 'Lunas') throw new Error('Transaksi sudah lunas');
      if (amountPaid < transaction.totalAmount) throw new Error('Jumlah pembayaran kurang');

      const now = new Date().toISOString();
      const change = amountPaid - transaction.totalAmount;

      // Update status
      await transactionRepo.update(transactionId, { status: 'Lunas', cashierName });

      const paymentId = `pay-${crypto.randomBytes(8).toString('hex')}`;
      await paymentRepo.insert({
        id: paymentId,
        transactionId,
        amountPaid,
        paymentMethod,
        timestamp: now,
      });

      // Record to cash book
      const dateStr = now.substring(0, 10);
      const cashBook = await cashRepo.getCashBookByDate(dateStr, pondokId, periodId);
      const amount = transaction.totalAmount;
      const isBilling = transaction.transactionType === 'Rental Komputer';

      if (!cashBook) {
        // Needs a bit more complex logic to get previous cash book balance,
        // For simplicity, we just use 0 here or we could fetch the last one.
        const kasAwal = 0; 
        await cashRepo.insert({
          id: `cb-${crypto.randomBytes(8).toString('hex')}`,
          date: dateStr,
          kasAwal,
          pemasukanBilling: isBilling ? amount : 0,
          pemasukanJasa: isBilling ? 0 : amount,
          pengeluaran: 0,
          kasAkhir: kasAwal + amount,
          periodId,
          pondokId,
        });
      } else {
        await cashRepo.update(cashBook.id, {
            pemasukanBilling: cashBook.pemasukanBilling + (isBilling ? amount : 0),
            pemasukanJasa: cashBook.pemasukanJasa + (isBilling ? 0 : amount),
            kasAkhir: cashBook.kasAkhir + amount,
        });
      }

      return { success: true, change };
    });
  }
}
