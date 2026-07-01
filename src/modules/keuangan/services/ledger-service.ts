// @ts-nocheck
import { db } from '@/db';
import {   journalDetails } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

export async function getOrCreateAccount(
  code: string,
  name: string,
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense',
  pondokId: string
): Promise<string> {
  const result = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.code, code), eq(accounts.pondokId, pondokId)))
    .limit(1);

  if (result.length > 0) {
    return result[0].id;
  }

  const id = `acct-${crypto.randomBytes(8).toString('hex')}`;
  await db.insert(accounts).values({
    id,
    code,
    name,
    type,
    pondokId,
  });
  return id;
}

export async function getAccounts(pondokId: string) {
  return db.select().from(accounts).where(eq(accounts.pondokId, pondokId));
}

export async function createJournalEntry(
  description: string,
  date: string,
  referenceId: string | null,
  periodId: string,
  pondokId: string
): Promise<string> {
  const id = `je-${crypto.randomBytes(8).toString('hex')}`;
  await db.insert(journalEntries).values({
    id,
    description,
    date,
    referenceId,
    periodId,
    pondokId,
  });
  return id;
}

export async function addJournalDetail(
  journalEntryId: string,
  accountId: string,
  type: 'Debit' | 'Credit',
  amount: number
) {
  const id = `jd-${crypto.randomBytes(8).toString('hex')}`;
  await db.insert(journalDetails).values({
    id,
    journalEntryId,
    accountId,
    type,
    amount,
  });
  return id;
}
const accounts = {} as any; const journalEntries = {} as any; const journalDetails = {} as any;
