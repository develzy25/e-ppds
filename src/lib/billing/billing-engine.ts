import { db } from '@/db';
import { generateReceiptNumber } from './receipt-service';
import { createTransaction } from './transaction-service';
import { cashBooks, cashMovements } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import crypto from 'crypto';
import { createJournalEntryForTransaction } from '../accounting/journal-engine';
import { writeAuditLog } from '../services/audit';

export interface ProcessBillingInput {
  module: 'LAB' | 'BUMP' | 'FINANCE';
  transactionType: string; // e.g. "LAB_PRINT", "LAUNDRY", "SYAHRIYAH"
  totalAmount: number;
  cashierName: string;
  paymentMethod: 'Tunai' | 'Transfer' | 'QRIS' | 'SantriAccount';
  items: {
    serviceRateId?: string;
    qty: number;
    priceAtSale: number;
  }[];
  santriId?: string;
  billingSessionId?: string;
  periodId: string;
  pondokId: string;
  userId?: string; // Optional: Cashier user ID for audit logging
}

export async function getOrCreateCashBook(date: string, pondokId: string, periodId: string) {
  const result = await db
    .select()
    .from(cashBooks)
    .where(
      and(
        eq(cashBooks.date, date),
        eq(cashBooks.pondokId, pondokId),
        eq(cashBooks.periodId, periodId)
      )
    )
    .limit(1);

  if (result.length > 0) {
    return result[0];
  }

  const previousResult = await db
    .select()
    .from(cashBooks)
    .where(and(eq(cashBooks.pondokId, pondokId), eq(cashBooks.periodId, periodId)))
    .orderBy(desc(cashBooks.date))
    .limit(1);

  const kasAwal = previousResult.length > 0 ? previousResult[0].kasAkhir : 0;
  const id = `cb-${crypto.randomBytes(8).toString('hex')}`;

  const initialCb = {
    id,
    date,
    kasAwal,
    pemasukanBilling: 0,
    pemasukanJasa: 0,
    pengeluaran: 0,
    kasAkhir: kasAwal,
    periodId,
    pondokId,
  };

  await db.insert(cashBooks).values(initialCb);
  return initialCb;
}

export async function addCashBookTransaction(
  date: string,
  type: 'Billing' | 'Jasa' | 'Pengeluaran',
  amount: number,
  pondokId: string,
  periodId: string
) {
  const cb = await getOrCreateCashBook(date, pondokId, periodId);

  const updateFields: Partial<typeof cb> = {};
  if (type === 'Billing') {
    updateFields.pemasukanBilling = cb.pemasukanBilling + amount;
    updateFields.kasAkhir = cb.kasAkhir + amount;
  } else if (type === 'Jasa') {
    updateFields.pemasukanJasa = cb.pemasukanJasa + amount;
    updateFields.kasAkhir = cb.kasAkhir + amount;
  } else if (type === 'Pengeluaran') {
    updateFields.pengeluaran = cb.pengeluaran + amount;
    updateFields.kasAkhir = cb.kasAkhir - amount;
  }

  await db
    .update(cashBooks)
    .set(updateFields)
    .where(eq(cashBooks.id, cb.id));
}

/**
 * Unified Billing Engine to process transactions, record in POS, update daily cash book,
 * and trigger double-entry journal entries.
 */
export async function processBilling({
  module,
  transactionType,
  totalAmount,
  cashierName,
  paymentMethod,
  items,
  santriId,
  billingSessionId,
  periodId,
  pondokId,
  userId,
}: ProcessBillingInput) {
  // 1. Generate unique invoice/receipt number using sequence service
  const dateObj = new Date();
  const year = dateObj.getFullYear();
  const prefix = `${module}-${year}-`;
  const transactionId = await generateReceiptNumber(
    `${module}_POS`,
    prefix,
    null,
    periodId,
    pondokId
  );

  // 2. Create the POS Transaction
  await createTransaction({
    transactionId,
    transactionType,
    billingSessionId,
    totalAmount,
    cashierName,
    items,
    payment: {
      amountPaid: totalAmount,
      paymentMethod,
    },
    santriId,
    periodId,
    pondokId,
  });

  const todayStr = dateObj.toISOString().split('T')[0];

  // 3. Update cash book for cash payments
  if (paymentMethod === 'Tunai') {
    // Determine whether Billing (computer rent) or Jasa
    const cashBookType = transactionType === 'Rental Komputer' ? 'Billing' : 'Jasa';
    await addCashBookTransaction(todayStr, cashBookType, totalAmount, pondokId, periodId);

    // Write cash movement record
    const movementId = `cm-${crypto.randomBytes(8).toString('hex')}`;
    await db.insert(cashMovements).values({
      id: movementId,
      date: todayStr,
      type: 'Debit', // debit = cash in
      amount: totalAmount,
      description: `Pemasukan POS ${module}: ${transactionType} (${transactionId})`,
      periodId,
      pondokId,
    });
  }

  // 4. Trigger double-entry accounting journal entries
  try {
    await createJournalEntryForTransaction({
      transactionId,
      module,
      transactionType,
      amount: totalAmount,
      description: `Jurnal POS ${module} - ${transactionType} (${transactionId})`,
      periodId,
      pondokId,
    });
  } catch (error) {
    console.error('Failed to create journal entry for billing:', error);
    // Log failure but do not roll back the POS transaction so that the cashier is not blocked
  }

  // 5. Write audit log entry
  try {
    await writeAuditLog({
      userId: userId || 'sys-cashier',
      action: 'BILLING_PAID',
      details: { transactionId, module, transactionType, totalAmount, paymentMethod },
      periodId,
      pondokId,
    });
  } catch (error) {
    console.error('Failed to write audit log for billing:', error);
  }

  return transactionId;
}
