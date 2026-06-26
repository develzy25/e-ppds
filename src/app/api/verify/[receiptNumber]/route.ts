import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { posTransactions, posTransactionItems } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { generateReceiptSignature } from '@/lib/print/qr-verification';

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ receiptNumber: string }> }
) {
  try {
    const { receiptNumber } = await props.params;
    const { searchParams } = new URL(req.url);
    const signature = searchParams.get('sig');

    // 1. Temukan data transaksi di database
    const txResult = await db
      .select()
      .from(posTransactions)
      .where(eq(posTransactions.id, receiptNumber))
      .limit(1);

    if (txResult.length === 0) {
      return NextResponse.json(
        { valid: false, error: 'Transaksi tidak ditemukan di database' },
        { status: 404 }
      );
    }

    const tx = txResult[0];

    // 2. Validasi signature (jika dikirimkan) untuk mencegah spoofing nomor nota acak
    if (signature) {
      const expectedSignature = generateReceiptSignature(tx.id, tx.totalAmount, tx.pondokId);
      if (signature !== expectedSignature) {
        return NextResponse.json(
          { valid: false, error: 'Tanda tangan digital tidak cocok! Struk ini tidak sah/telah dimanipulasi.' },
          { status: 400 }
        );
      }
    }

    // 3. Muat detail item belanja transaksi
    const items = await db
      .select()
      .from(posTransactionItems)
      .where(eq(posTransactionItems.transactionId, tx.id));

    return NextResponse.json({
      valid: true,
      transaction: {
        id: tx.id,
        type: tx.transactionType,
        totalAmount: tx.totalAmount,
        status: tx.status,
        cashierName: tx.cashierName,
        createdAt: tx.createdAt,
        items: items.map((item) => ({
          id: item.id,
          qty: item.qty,
          priceAtSale: item.priceAtSale,
        })),
      },
    });
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { valid: false, error: errMessage },
      { status: 500 }
    );
  }
}
