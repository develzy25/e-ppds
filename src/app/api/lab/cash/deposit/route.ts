import { NextRequest, NextResponse } from 'next/server';
import { recordDepositToTreasurer } from '@/lib/services/laboratorium';

export async function POST(req: NextRequest) {
  try {
    const { amountToDeposit, keterangan, verifiedBy, periodId, pondokId } = await req.json();

    if (amountToDeposit === undefined || !periodId || !pondokId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const depositId = await recordDepositToTreasurer(amountToDeposit, keterangan || '', verifiedBy || null, periodId, pondokId);
    return NextResponse.json({ success: true, depositId });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
