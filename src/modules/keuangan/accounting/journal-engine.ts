import { getAccountMapping } from './account-mapping';
import { createJournalEntry, addJournalDetail, getOrCreateAccount } from './ledger-service';

export interface CreateJournalInput {
  transactionId: string;
  module: string;
  transactionType: string;
  amount: number;
  description: string;
  periodId: string;
  pondokId: string;
  paymentMethod?: 'Tunai' | 'Transfer' | 'QRIS' | 'SantriAccount';
}

/**
 * Journal Engine to automatically generate double-entry records (debit and credit journal details)
 * for transactions across all ERP modules.
 */
export async function createJournalEntryForTransaction({
  transactionId,
  module,
  transactionType,
  amount,
  description,
  periodId,
  pondokId,
  paymentMethod = 'Tunai',
}: CreateJournalInput): Promise<string> {
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Get standard debit/credit account mappings
  const mapping = await getAccountMapping(module, transactionType, pondokId);

  let debitAccountId = mapping.debitAccountId;
  const creditAccountId = mapping.creditAccountId;

  // 2. Adjust debit account dynamically based on payment method override
  if (paymentMethod === 'SantriAccount') {
    // Charged to Student Receivable (Piutang Santri)
    debitAccountId = await getOrCreateAccount('102', 'Piutang Santri', 'Asset', pondokId);
  } else if (paymentMethod === 'Transfer' || paymentMethod === 'QRIS') {
    // Received via Bank Account / QRIS Gateway
    debitAccountId = await getOrCreateAccount('101.02', 'Kas Bank / QRIS', 'Asset', pondokId);
  }

  // 3. Insert header journal entry
  const journalEntryId = await createJournalEntry(
    description,
    todayStr,
    transactionId,
    periodId,
    pondokId
  );

  // 4. Insert ledger details (Double-Entry: Debit + Credit)
  await addJournalDetail(journalEntryId, debitAccountId, 'Debit', amount);
  await addJournalDetail(journalEntryId, creditAccountId, 'Credit', amount);

  return journalEntryId;
}
