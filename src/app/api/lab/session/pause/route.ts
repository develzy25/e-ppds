import { NextRequest, NextResponse } from 'next/server';
import { pauseBillingSession } from '@/lib/services/laboratorium';

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    await pauseBillingSession(sessionId);
    return NextResponse.json({ success: true, message: 'Session paused successfully' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
