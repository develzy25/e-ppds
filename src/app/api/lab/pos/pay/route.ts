import { NextRequest, NextResponse } from 'next/server';
import { payTransaction } from '@/lib/services/laboratorium';

export async function POST(req: NextRequest) {
  try {
    const { transactionId, paymentMethod, amountPaid, cashierName, periodId, pondokId } = await req.json();

    if (!transactionId || !paymentMethod || amountPaid === undefined || !cashierName || !periodId || !pondokId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const result = await payTransaction(transactionId, paymentMethod, amountPaid, cashierName, periodId, pondokId);
    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
