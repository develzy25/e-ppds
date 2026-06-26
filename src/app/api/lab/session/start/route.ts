import { NextRequest, NextResponse } from 'next/server';
import { startBillingSession } from '@/lib/services/laboratorium';

export async function POST(req: NextRequest) {
  try {
    const { clientId, santriId, tarifId, periodId, pondokId } = await req.json();

    if (!clientId || !tarifId || !periodId || !pondokId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const sessionId = await startBillingSession(clientId, santriId, tarifId, periodId, pondokId);
    return NextResponse.json({ success: true, sessionId });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
