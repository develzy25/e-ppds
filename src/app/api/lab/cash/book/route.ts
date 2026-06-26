import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { cashBooks, cashMovements } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const pondokId = searchParams.get('pondokId');

    if (!date || !pondokId) {
      return NextResponse.json(
        { success: false, error: 'Date and Pondok ID are required' },
        { status: 400 }
      );
    }

    const cashBook = await db
      .select()
      .from(cashBooks)
      .where(
        and(
          eq(cashBooks.date, date),
          eq(cashBooks.pondokId, pondokId)
        )
      )
      .then((res) => res[0] || null);

    const movements = await db
      .select()
      .from(cashMovements)
      .where(
        and(
          eq(cashMovements.date, date),
          eq(cashMovements.pondokId, pondokId)
        )
      );

    return NextResponse.json({ success: true, cashBook, movements });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
