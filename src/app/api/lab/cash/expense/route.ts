import { NextRequest, NextResponse } from 'next/server';
import { recordExpense } from '@/lib/services/laboratorium';

export async function POST(req: NextRequest) {
  try {
    const { amount, description, periodId, pondokId } = await req.json();

    if (amount === undefined || !description || !periodId || !pondokId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    await recordExpense(amount, description, periodId, pondokId);
    return NextResponse.json({ success: true, message: 'Expense recorded successfully' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
