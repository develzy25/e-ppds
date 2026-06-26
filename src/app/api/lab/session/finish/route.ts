import { NextRequest, NextResponse } from 'next/server';
import { finishBillingSession } from '@/lib/services/laboratorium';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, cashierName, periodId, pondokId } = await req.json();

    if (!sessionId || !cashierName || !periodId || !pondokId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const transactionId = await finishBillingSession(sessionId, cashierName, periodId, pondokId);
    return NextResponse.json({ success: true, transactionId });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
