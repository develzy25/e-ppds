import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { posTransactions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pondokId = searchParams.get('pondokId');

    if (!pondokId) {
      return NextResponse.json(
        { success: false, error: 'Pondok ID is required' },
        { status: 400 }
      );
    }

    const pending = await db
      .select()
      .from(posTransactions)
      .where(
        and(
          eq(posTransactions.status, 'Menunggu Pembayaran'),
          eq(posTransactions.pondokId, pondokId)
        )
      );

    return NextResponse.json({ success: true, pending });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
