import { NextRequest, NextResponse } from 'next/server';
import { sendAgentHeartbeat } from '@/lib/services/laboratorium';

export async function POST(req: NextRequest) {
  try {
    const { hostname, macAddress, status, uptime, pondokId } = await req.json();

    if (!hostname || !macAddress || !status || uptime === undefined || !pondokId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const clientId = await sendAgentHeartbeat(hostname, macAddress, status, uptime, pondokId);
    return NextResponse.json({ success: true, clientId });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
