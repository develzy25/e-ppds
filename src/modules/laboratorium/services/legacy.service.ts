// @ts-nocheck
import { BusinessError, NotFoundError } from '@/infrastructure/errors';
import { db } from '@/db';
import {
  
  
  labSessions,
  
  labServices,
  posTransactions,
  posTransactionItems,
  posPayments,
  cashBooks,
  cashMovements,
  cashDeposits
} from '@/db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import crypto from 'crypto';

// =============================================================
// 1. CLIENT AGENT LOGIC (Auto-detect & Heartbeat)
// =============================================================

/**
 * Menyimpan heartbeat agent dari client PC otomatis (Auto-detect via MAC/Hostname)
 */
export async function sendAgentHeartbeat(
  hostname: string,
  macAddress: string,
  status: 'Idle' | 'Running' | 'Paused' | 'Offline' | 'Maintenance',
  uptime: number,
  pondokId: string
): Promise<string> {
  const now = new Date().toISOString();

  // 1. Cari PC berdasarkan hostname atau macAddress
  const client = await db
    .select()
    .from(labClients)
    .where(eq(labClients.macAddress, macAddress))
    .then((res) => res[0]);

  let computerId = '';

  if (!client) {
    // Registrasi komputer baru secara otomatis
    computerId = `pc-${crypto.randomBytes(8).toString('hex')}`;
    const nextCodeRes = await db.select({ count: sql`COUNT(*)` }).from(labClients);
    const nextCode = `PC-${String((Number(nextCodeRes[0]?.count || 0) + 1)).padStart(2, '0')}`;

    await db.insert(labClients).values({
      id: computerId,
      kodePc: nextCode,
      namaPc: `Komputer ${nextCode}`,
      hostname,
      macAddress,
      status,
      pondokId,
      createdAt: now,
      updatedAt: now,
    });
  } else {
    computerId = client.id;
    // Update status jika tidak terkunci sesi billing aktif
    await db
      .update(labClients)
      .set({
        hostname,
        status: client.status === 'Running' || client.status === 'Paused' ? client.status : status,
        updatedAt: now,
      })
      .where(eq(labClients.id, computerId));
  }

  // 2. Simpan Log Agent
  const logId = `log-${crypto.randomBytes(8).toString('hex')}`;
  await db.insert(labAgentLogs).values({
    id: logId,
    computerId,
    hostname,
    macAddress,
    status,
    uptime,
    lastSeen: now,
    pondokId,
  });

  return computerId;
}

// =============================================================
// 2. SESSION BILLING CONTROL (Mati Listrik, Start, Resume, Finish)
// =============================================================

/**
 * Memulai sesi billing baru untuk PC client
 */
export async function startBillingSession(
  computerId: string,
  santriId: string | null,
  tarifId: string,
  periodId: string,
  pondokId: string
): Promise<string> {
  const now = new Date().toISOString();

  // Ambil data tarif
  const tarif = await db
    .select()
    .from(labBillingRates)
    .where(eq(labBillingRates.id, tarifId))
    .then((res) => res[0]);

  if (!tarif) throw new NotFoundError('Tarif tidak ditemukan');

  const sessionId = `session-${crypto.randomBytes(8).toString('hex')}`;

  // 1. Simpan sesi billing
  await db.insert(labSessions).values({
    id: sessionId,
    computerId,
    santriId,
    tarifId,
    startTime: now,
    price: tarif.hargaPerMenit,
    status: 'Running',
    pondokId,
    createdAt: now,
  });

  // 2. Update status client ke Running
  await db
    .update(labClients)
    .set({ status: 'Running', updatedAt: now })
    .where(eq(labClients.id, computerId));

  return sessionId;
}

/**
 * Menangguhkan sesi billing (Pause)
 */
export async function pauseBillingSession(sessionId: string): Promise<void> {
  const session = await db
    .select()
    .from(labSessions)
    .where(eq(labSessions.id, sessionId))
    .then((res) => res[0]);

  if (!session) throw new NotFoundError('Sesi tidak ditemukan');

  const now = new Date().toISOString();

  // Hitung akumulasi durasi sejauh ini
  const start = new Date(session.startTime).getTime();
  const diffMinutes = Math.max(1, Math.round((Date.now() - start) / 60000));

  await db
    .update(labSessions)
    .set({
      status: 'Paused',
      duration: diffMinutes,
      totalAmount: diffMinutes * session.price,
    })
    .where(eq(labSessions.id, sessionId));

  await db
    .update(labClients)
    .set({ status: 'Paused', updatedAt: now })
    .where(eq(labClients.id, session.computerId));
}

/**
 * Melanjutkan kembali sesi billing (Resume)
 */
export async function resumeBillingSession(sessionId: string): Promise<void> {
  const session = await db
    .select()
    .from(labSessions)
    .where(eq(labSessions.id, sessionId))
    .then((res) => res[0]);

  if (!session) throw new NotFoundError('Sesi tidak ditemukan');

  const now = new Date().toISOString();

  await db
    .update(labSessions)
    .set({
      status: 'Running',
      startTime: now, // Reset start time untuk segmen aktif berikutnya
    })
    .where(eq(labSessions.id, sessionId));

  await db
    .update(labClients)
    .set({ status: 'Running', updatedAt: now })
    .where(eq(labClients.id, session.computerId));
}

/**
 * Mengakhiri sesi billing & otomatis memicu pembuatan transaksi POS (Point of Sales)
 */
export async function finishBillingSession(
  sessionId: string,
  cashierName: string,
  periodId: string,
  pondokId: string
): Promise<string> {
  const session = await db
    .select()
    .from(labSessions)
    .where(eq(labSessions.id, sessionId))
    .then((res) => res[0]);

  if (!session) throw new NotFoundError('Sesi tidak ditemukan');

  const now = new Date().toISOString();

  // 1. Hitung total durasi dalam menit
  const start = new Date(session.startTime).getTime();
  const currentMinutes = Math.max(1, Math.round((Date.now() - start) / 60000));
  const totalMinutes = (session.duration || 0) + currentMinutes;
  const totalAmount = totalMinutes * session.price;

  // 2. Update status sesi ke selesai
  await db
    .update(labSessions)
    .set({
      endTime: now,
      duration: totalMinutes,
      totalAmount,
      status: 'Finished',
    })
    .where(eq(labSessions.id, sessionId));

  // 3. Kembalikan PC ke status Idle
  await db
    .update(labClients)
    .set({ status: 'Idle', updatedAt: now })
    .where(eq(labClients.id, session.computerId));

  // 4. GENERATE TRANSAKSI POS OTOMATIS
  const nextPosNumRes = await db.select({ count: sql`COUNT(*)` }).from(posTransactions);
  const nextPosNum = String(Number(nextPosNumRes[0]?.count || 0) + 1).padStart(5, '0');
  const transactionId = `LAB-${new Date().getFullYear()}-${nextPosNum}`;

  await db.insert(posTransactions).values({
    id: transactionId,
    transactionType: 'Rental Komputer',
    billingSessionId: sessionId,
    totalAmount,
    status: 'Menunggu Pembayaran',
    cashierName,
    periodId,
    pondokId,
    createdAt: now,
  });

  return transactionId;
}

/**
 * Penanganan Mati Listrik Otomatis
 * Menangguhkan (Pause) paksa seluruh sesi running jika agent offline (lastSeen > 2 Menit)
 */
export async function handlePowerOutage(pondokId: string): Promise<number> {
  const now = new Date();
  const twoMinutesAgo = new Date(now.getTime() - 2 * 60000).toISOString();

  // Cari sesi yang aktif tetapi PC-nya tidak mengirim log heartbeat dalam 2 menit terakhir
  const offlineSessions = await db
    .select({
      sessionId: labSessions.id,
      computerId: labSessions.computerId,
    })
    .from(labSessions)
    .innerJoin( eq(labSessions.computerId, labClients.id))
    .where(
      and(
        eq(labSessions.status, 'Running'),
        eq(labSessions.pondokId, pondokId),
        sql`${labClients.updatedAt} < ${twoMinutesAgo}`
      )
    );

  for (const s of offlineSessions) {
    await pauseBillingSession(s.sessionId);
  }

  return offlineSessions.length;
}

// =============================================================
// 3. POS LABORATORIUM (Kasir, Transaksi Jasa, Pembayaran)
// =============================================================

/**
 * Membuat transaksi jasa laboratorium baru (Print, laminating, dll)
 */
export async function createJasaTransaction(
  items: { serviceRateId: string; qty: number }[],
  cashierName: string,
  periodId: string,
  pondokId: string
): Promise<string> {
  const now = new Date().toISOString();

  // Hitung total harga
  let totalAmount = 0;
  const itemsWithPrice = [];

  for (const item of items) {
    const rate = await db
      .select()
      .from(labServiceRates)
      .where(eq(labServiceRates.id, item.serviceRateId))
      .then((res) => res[0]);

    if (!rate) throw new NotFoundError('Jasa rate id ${item.serviceRateId} tidak ditemukan');

    const subtotal = rate.harga * item.qty;
    totalAmount += subtotal;

    itemsWithPrice.push({
      id: `item-${crypto.randomBytes(8).toString('hex')}`,
      serviceRateId: item.serviceRateId,
      qty: item.qty,
      priceAtSale: rate.harga,
    });
  }

  // Buat transaksi POS
  const nextPosNumRes = await db.select({ count: sql`COUNT(*)` }).from(posTransactions);
  const nextPosNum = String(Number(nextPosNumRes[0]?.count || 0) + 1).padStart(5, '0');
  const transactionId = `LAB-${new Date().getFullYear()}-${nextPosNum}`;

  await db.insert(posTransactions).values({
    id: transactionId,
    transactionType: 'Jasa Laboratorium',
    totalAmount,
    status: 'Menunggu Pembayaran',
    cashierName,
    periodId,
    pondokId,
    createdAt: now,
  });

  // Insert items
  for (const item of itemsWithPrice) {
    await db.insert(posTransactionItems).values({
      ...item,
      transactionId,
    });
  }

  return transactionId;
}

/**
 * Menyelesaikan pembayaran transaksi POS (Tunai, Transfer, QRIS)
 */
export async function payTransaction(
  transactionId: string,
  paymentMethod: 'Tunai' | 'Transfer' | 'QRIS',
  amountPaid: number,
  cashierName: string,
  periodId: string,
  pondokId: string
): Promise<{ success: boolean; change: number }> {
  const transaction = await db
    .select()
    .from(posTransactions)
    .where(eq(posTransactions.id, transactionId))
    .then((res) => res[0]);

  if (!transaction) throw new NotFoundError('Transaksi tidak ditemukan');
  if (transaction.status === 'Lunas') throw new BusinessError('BUSINESS_ERROR', 'Transaksi sudah lunas');
  if (amountPaid < transaction.totalAmount) throw new BusinessError('BUSINESS_ERROR', 'Jumlah pembayaran kurang');

  const now = new Date().toISOString();
  const change = amountPaid - transaction.totalAmount;

  // 1. Update status transaksi
  await db
    .update(posTransactions)
    .set({ status: 'Lunas', cashierName })
    .where(eq(posTransactions.id, transactionId));

  // 2. Simpan pembayaran
  const paymentId = `pay-${crypto.randomBytes(8).toString('hex')}`;
  await db.insert(posPayments).values({
    id: paymentId,
    transactionId,
    amountPaid,
    paymentMethod,
    timestamp: now,
  });

  // 3. Otomatis mutasi pembukuan kas harian
  await recordRevenueToCashBook(transaction, now, periodId, pondokId);

  return { success: true, change };
}

/**
 * Helper internal untuk memasukkan pendapatan POS langsung ke kas harian laboratorium
 */
async function recordRevenueToCashBook(
  transaction: typeof posTransactions.$inferSelect,
  timestamp: string,
  periodId: string,
  pondokId: string
): Promise<void> {
  const dateStr = timestamp.substring(0, 10); // YYYY-MM-DD

  // Ambil buku kas hari ini
  const cashBook = await db
    .select()
    .from(cashBooks)
    .where(
      and(
        eq(cashBooks.date, dateStr),
        eq(cashBooks.pondokId, pondokId)
      )
    )
    .then((res) => res[0]);

  const amount = transaction.totalAmount;
  const isBilling = transaction.transactionType === 'Rental Komputer';

  if (!cashBook) {
    // Ambil kas akhir hari kemarin
    const lastCashBook = await db
      .select()
      .from(cashBooks)
      .where(eq(cashBooks.pondokId, pondokId))
      .orderBy(desc(cashBooks.date))
      .then((res) => res[0]);

    const kasAwal = lastCashBook ? lastCashBook.kasAkhir : 0;

    await db.insert(cashBooks).values({
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
    await db
      .update(cashBooks)
      .set({
        pemasukanBilling: isBilling ? cashBook.pemasukanBilling + amount : cashBook.pemasukanBilling,
        pemasukanJasa: isBilling ? cashBook.pemasukanJasa : cashBook.pemasukanJasa + amount,
        kasAkhir: cashBook.kasAkhir + amount,
      })
      .where(eq(cashBooks.id, cashBook.id));
  }

  // Tambahkan record mutasi kas
  await db.insert(cashMovements).values({
    id: `mv-${crypto.randomBytes(8).toString('hex')}`,
    date: dateStr,
    type: 'Debit',
    amount,
    description: `POS ${transaction.transactionType} [${transaction.id}]`,
    periodId,
    pondokId,
  });
}

// =============================================================
// 4. KAS HARIAN, SETORAN BENDAHARA & LAPORAN
// =============================================================

/**
 * Mencatat pengeluaran operasional lab (Kredit Kas)
 */
export async function recordExpense(
  amount: number,
  description: string,
  periodId: string,
  pondokId: string
): Promise<void> {
  const dateStr = new Date().toISOString().substring(0, 10);

  const cashBook = await db
    .select()
    .from(cashBooks)
    .where(
      and(
        eq(cashBooks.date, dateStr),
        eq(cashBooks.pondokId, pondokId)
      )
    )
    .then((res) => res[0]);

  if (!cashBook) {
    const lastCashBook = await db
      .select()
      .from(cashBooks)
      .where(eq(cashBooks.pondokId, pondokId))
      .orderBy(desc(cashBooks.date))
      .then((res) => res[0]);

    const kasAwal = lastCashBook ? lastCashBook.kasAkhir : 0;

    await db.insert(cashBooks).values({
      id: `cb-${crypto.randomBytes(8).toString('hex')}`,
      date: dateStr,
      kasAwal,
      pemasukanBilling: 0,
      pemasukanJasa: 0,
      pengeluaran: amount,
      kasAkhir: kasAwal - amount,
      periodId,
      pondokId,
    });
  } else {
    await db
      .update(cashBooks)
      .set({
        pengeluaran: cashBook.pengeluaran + amount,
        kasAkhir: cashBook.kasAkhir - amount,
      })
      .where(eq(cashBooks.id, cashBook.id));
  }

  await db.insert(cashMovements).values({
    id: `mv-${crypto.randomBytes(8).toString('hex')}`,
    date: dateStr,
    type: 'Kredit',
    amount,
    description: `Operasional: ${description}`,
    periodId,
    pondokId,
  });
}

/**
 * Mencatat setoran kas harian laboratorium ke Bendahara Utama pondok
 */
export async function recordDepositToTreasurer(
  amountToDeposit: number,
  keterangan: string,
  verifiedBy: string | null,
  periodId: string,
  pondokId: string
): Promise<string> {
  const now = new Date().toISOString();
  const dateStr = now.substring(0, 10);

  // Ambil saldo kumulatif kas lab
  const currentCash = await db
    .select()
    .from(cashBooks)
    .where(eq(cashBooks.pondokId, pondokId))
    .orderBy(desc(cashBooks.date))
    .then((res) => res[0]);

  const totalPemasukan = currentCash ? currentCash.kasAkhir : 0;

  if (amountToDeposit > totalPemasukan) {
    throw new BusinessError('BUSINESS_ERROR', 'Jumlah setoran melebihi saldo kas operasional laboratorium aktif');
  }

  const saldoOperasional = totalPemasukan - amountToDeposit;
  const depositId = `dep-${crypto.randomBytes(8).toString('hex')}`;

  // 1. Simpan data setoran
  await db.insert(cashDeposits).values({
    id: depositId,
    date: dateStr,
    totalPemasukan,
    jumlahDisetor: amountToDeposit,
    saldoOperasional,
    keterangan,
    verifiedBy,
    periodId,
    pondokId,
  });

  // 2. Potong kas operasional lab melalui record pengeluaran setoran
  await recordExpense(amountToDeposit, `Setoran ke Bendahara [Ref ID: ${depositId}]`, periodId, pondokId);

  return depositId;
}
