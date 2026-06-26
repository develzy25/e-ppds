import { db } from '@/db';
import { accountMappings } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';
import { getOrCreateAccount } from './ledger-service';

export async function getAccountMapping(
  module: string,
  transactionType: string,
  pondokId: string
) {
  const result = await db
    .select()
    .from(accountMappings)
    .where(
      and(
        eq(accountMappings.module, module),
        eq(accountMappings.transactionType, transactionType),
        eq(accountMappings.pondokId, pondokId)
      )
    )
    .limit(1);

  if (result.length > 0) {
    return {
      debitAccountId: result[0].debitAccountId,
      creditAccountId: result[0].creditAccountId,
    };
  }

  // Fallback mappings: automatically initialize standard COA accounts and map them
  const debitCode = '101'; // Kas
  const debitName = 'Kas Utama';
  const debitType = 'Asset';

  let creditCode = '401'; // Pendapatan
  let creditName = 'Pendapatan';
  const creditType = 'Revenue';

  if (module === 'LAB') {
    creditCode = '401';
    creditName = 'Pendapatan Laboratorium';
  } else if (module === 'BUMP') {
    creditCode = '402';
    creditName = 'Pendapatan BUMP';
  } else if (module === 'FINANCE') {
    creditCode = '403';
    creditName = 'Pendapatan Keuangan';
  }

  // Ensure accounts exist and get their IDs
  const debitAccountId = await getOrCreateAccount(debitCode, debitName, debitType, pondokId);
  const creditAccountId = await getOrCreateAccount(creditCode, creditName, creditType, pondokId);

  // Save the mapping for future use
  const id = `am-${crypto.randomBytes(8).toString('hex')}`;
  await db.insert(accountMappings).values({
    id,
    module,
    transactionType,
    debitAccountId,
    creditAccountId,
    pondokId,
  });

  return { debitAccountId, creditAccountId };
}

export async function setAccountMapping(
  module: string,
  transactionType: string,
  debitAccountId: string,
  creditAccountId: string,
  pondokId: string
) {
  const existing = await db
    .select()
    .from(accountMappings)
    .where(
      and(
        eq(accountMappings.module, module),
        eq(accountMappings.transactionType, transactionType),
        eq(accountMappings.pondokId, pondokId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(accountMappings)
      .set({ debitAccountId, creditAccountId })
      .where(eq(accountMappings.id, existing[0].id));
  } else {
    const id = `am-${crypto.randomBytes(8).toString('hex')}`;
    await db.insert(accountMappings).values({
      id,
      module,
      transactionType,
      debitAccountId,
      creditAccountId,
      pondokId,
    });
  }
}
