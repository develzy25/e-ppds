// @ts-nocheck
import { db } from '@/db';
import { NotFoundError, ConflictError } from '@/infrastructure/errors';
import {
  posTransactions,
  posTransactionItems,
  posPayments,
  studentAccounts,
  studentLedgers,
} from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

export interface CreatePOSItemInput {
  serviceRateId?: string; // labServiceRates ID
  qty: number;
  priceAtSale: number;
}

export interface CreatePOSPaymentInput {
  amountPaid: number;
  paymentMethod: string; // "Tunai" | "Transfer" | "QRIS" | "SantriAccount"
}

export interface CreateTransactionInput {
  transactionId: string; // generated via receipt-service
  transactionType: string; // e.g. "Rental Komputer", "Jasa Laboratorium", "Laundry", etc.
  billingSessionId?: string;
  totalAmount: number;
  cashierName: string;
  items: CreatePOSItemInput[];
  payment?: CreatePOSPaymentInput;
  santriId?: string; // optional: if charged to a student
  periodId: string;
  pondokId: string;
}

export async function createTransaction({
  transactionId,
  transactionType,
  billingSessionId,
  totalAmount,
  cashierName,
  items,
  payment,
  santriId,
  periodId,
  pondokId,
}: CreateTransactionInput) {
  const status = payment ? 'Lunas' : 'Menunggu Pembayaran';
  const now = new Date().toISOString();

  // 1. Insert posTransactions
  await db.insert(posTransactions).values({
    id: transactionId,
    transactionType,
    billingSessionId: billingSessionId || null,
    totalAmount,
    status,
    cashierName,
    periodId,
    pondokId,
    createdAt: now,
  });

  // 2. Insert items
  for (const item of items) {
    const itemId = `txitem-${crypto.randomBytes(8).toString('hex')}`;
    await db.insert(posTransactionItems).values({
      id: itemId,
      transactionId,
      serviceRateId: item.serviceRateId || null,
      qty: item.qty,
      priceAtSale: item.priceAtSale,
    });
  }

  // 3. Handle payment
  if (payment) {
    const paymentId = `pay-${crypto.randomBytes(8).toString('hex')}`;
    await db.insert(posPayments).values({
      id: paymentId,
      transactionId,
      amountPaid: payment.amountPaid,
      paymentMethod: payment.paymentMethod,
      timestamp: now,
    });

    // 4. Handle student ledger if payment is via SantriAccount
    if (payment.paymentMethod === 'SantriAccount' && santriId) {
      // Find or create student account
      const studentAccountResult = await db
        .select()
        .from(studentAccounts)
        .where(
          and(
            eq(studentAccounts.santriId, santriId),
            eq(studentAccounts.periodId, periodId),
            eq(studentAccounts.pondokId, pondokId)
          )
        )
        .limit(1);

      let studentAccountId = '';
      let currentBalance = 0;
      if (studentAccountResult.length === 0) {
        studentAccountId = `sacct-${crypto.randomBytes(8).toString('hex')}`;
        // Create account
        await db.insert(studentAccounts).values({
          id: studentAccountId,
          santriId,
          currentBalance: -totalAmount, // Negative since it's a charge/debit
          limitReceivable: 500000, // default limit
          updatedAt: now,
          periodId,
          pondokId,
        });
      } else {
        const studentAcct = studentAccountResult[0];
        studentAccountId = studentAcct.id;
        currentBalance = studentAcct.currentBalance;
        // Update balance (deduct the transaction amount)
        await db
          .update(studentAccounts)
          .set({
            currentBalance: currentBalance - totalAmount,
            updatedAt: now,
          })
          .where(eq(studentAccounts.id, studentAccountId));
      }

      // Add to student ledgers
      const ledgerId = `sl-${crypto.randomBytes(8).toString('hex')}`;
      await db.insert(studentLedgers).values({
        id: ledgerId,
        studentAccountId,
        transactionId,
        type: 'Debit', // Debit = Charges
        amount: totalAmount,
        description: `Transaksi POS: ${transactionType} (${transactionId})`,
        timestamp: now,
        periodId,
        pondokId,
      });
    }
  }

  return transactionId;
}

export async function voidTransaction(transactionId: string, pondokId: string, periodId: string) {
  const transactionResult = await db
    .select()
    .from(posTransactions)
    .where(
      and(
        eq(posTransactions.id, transactionId),
        eq(posTransactions.pondokId, pondokId),
        eq(posTransactions.periodId, periodId)
      )
    )
    .limit(1);

  if (transactionResult.length === 0) {
    throw new NotFoundError(`Transaction with ID "${transactionId}"`);
  }

  const transaction = transactionResult[0];
  if (transaction.status === 'Dibatalkan') {
    throw new ConflictError(`Transaction "${transactionId}" is already voided.`);
  }

  const now = new Date().toISOString();

  // Update status to Dibatalkan
  await db
    .update(posTransactions)
    .set({ status: 'Dibatalkan' })
    .where(eq(posTransactions.id, transactionId));

  // If paid via SantriAccount, reverse ledger entry
  const payments = await db
    .select()
    .from(posPayments)
    .where(eq(posPayments.transactionId, transactionId));

  const santriPayment = payments.find((p) => p.paymentMethod === 'SantriAccount');
  if (santriPayment) {
    const ledgerResult = await db
      .select()
      .from(studentLedgers)
      .where(eq(studentLedgers.transactionId, transactionId))
      .limit(1);

    if (ledgerResult.length > 0) {
      const ledger = ledgerResult[0];
      const studentAccountId = ledger.studentAccountId;

      const studentAcctResult = await db
        .select()
        .from(studentAccounts)
        .where(eq(studentAccounts.id, studentAccountId))
        .limit(1);

      if (studentAcctResult.length > 0) {
        const studentAcct = studentAcctResult[0];
        // Add back the amount to the balance
        await db
          .update(studentAccounts)
          .set({
            currentBalance: studentAcct.currentBalance + transaction.totalAmount,
            updatedAt: now,
          })
          .where(eq(studentAccounts.id, studentAccountId));
      }

      // Add credit entry to reverse the debit
      const newLedgerId = `sl-${crypto.randomBytes(8).toString('hex')}`;
      await db.insert(studentLedgers).values({
        id: newLedgerId,
        studentAccountId,
        transactionId,
        type: 'Credit', // Credit = Payment/Adjustment
        amount: transaction.totalAmount,
        description: `Void Transaksi POS: ${transaction.transactionType} (${transactionId})`,
        timestamp: now,
        periodId,
        pondokId,
      });
    }
  }
}
