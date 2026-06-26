import { NextRequest, NextResponse } from 'next/server';
import { handlePowerOutage } from '@/lib/services/laboratorium';

export async function POST(req: NextRequest) {
  try {
    const { pondokId } = await req.json();

    if (!pondokId) {
      return NextResponse.json(
        { success: false, error: 'Pondok ID is required' },
        { status: 400 }
      );
    }

    const pausedCount = await handlePowerOutage(pondokId);
    return NextResponse.json({ success: true, pausedCount });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
