import { db } from '@/db';
import { santri, invoices, perizinans, pelanggarans, kasPondokMutasis, apotekObats } from '@/db/schema';
import { eq, and, sql, sum, count } from 'drizzle-orm';

export interface DashboardMetrics {
  totalSantri: number;
  revenueThisMonth: number;
  activePermits: number;
  activeOffenses: number;
  kasSaldo: number;
  lowStockItemsCount: number;
}

/**
 * Service Layer untuk mengagregasikan seluruh statistik utama dashboard PPDS ERP secara efisien
 */
export async function getDashboardMetrics(
  periodId: string,
  pondokId: string,
  billingMonth: string // e.g. "Juni 2026"
): Promise<DashboardMetrics> {
  // 1. Total Santri Aktif
  const santriRes = await db
    .select({ count: count() })
    .from(santri)
    .where(
      and(
        eq(santri.periodId, periodId),
        eq(santri.pondokId, pondokId),
        eq(santri.statusAktif, 'Aktif')
      )
    );
  const totalSantri = santriRes[0]?.count || 0;

  // 2. Pendapatan Bulan Ini (Invoice Lunas)
  const revenueRes = await db
    .select({ total: sum(invoices.totalAmount) })
    .from(invoices)
    .where(
      and(
        eq(invoices.periodId, periodId),
        eq(invoices.pondokId, pondokId),
        eq(invoices.billingMonth, billingMonth),
        eq(invoices.status, 'Lunas')
      )
    );
  const revenueThisMonth = Number(revenueRes[0]?.total || 0);

  // 3. Perizinan Aktif (Izin Keluar tetapi belum kembali)
  const permitsRes = await db
    .select({ count: count() })
    .from(perizinans)
    .where(
      and(
        eq(perizinans.periodId, periodId),
        eq(perizinans.pondokId, pondokId),
        eq(perizinans.status, 'Aktif')
      )
    );
  const activePermits = permitsRes[0]?.count || 0;

  // 4. Pelanggaran Aktif (Kasus Dilaporkan yang belum selesai penanganannya)
  const offensesRes = await db
    .select({ count: count() })
    .from(pelanggarans)
    .where(
      and(
        eq(pelanggarans.periodId, periodId),
        eq(pelanggarans.pondokId, pondokId),
        eq(pelanggarans.status, 'Dilaporkan')
      )
    );
  const activeOffenses = offensesRes[0]?.count || 0;

  // 5. Hitung Saldo Kas Pondok (Debit - Kredit)
  const debitRes = await db
    .select({ total: sum(kasPondokMutasis.amount) })
    .from(kasPondokMutasis)
    .where(
      and(
        eq(kasPondokMutasis.periodId, periodId),
        eq(kasPondokMutasis.pondokId, pondokId),
        eq(kasPondokMutasis.type, 'Debit')
      )
    );
  
  const kreditRes = await db
    .select({ total: sum(kasPondokMutasis.amount) })
    .from(kasPondokMutasis)
    .where(
      and(
        eq(kasPondokMutasis.periodId, periodId),
        eq(kasPondokMutasis.pondokId, pondokId),
        eq(kasPondokMutasis.type, 'Kredit')
      )
    );

  const totalDebit = Number(debitRes[0]?.total || 0);
  const totalKredit = Number(kreditRes[0]?.total || 0);
  const kasSaldo = totalDebit - totalKredit;

  // 6. Inventaris/Obat Stok Menipis (Stok < 10)
  const lowStockApotek = await db
    .select({ count: count() })
    .from(apotekObats)
    .where(
      and(
        eq(apotekObats.pondokId, pondokId),
        sql`${apotekObats.stock} < 10`
      )
    );

  const lowStockItemsCount = (lowStockApotek[0]?.count || 0);

  return {
    totalSantri,
    revenueThisMonth,
    activePermits,
    activeOffenses,
    kasSaldo,
    lowStockItemsCount,
  };
}
