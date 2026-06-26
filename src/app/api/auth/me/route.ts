import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/services/auth';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Tidak diizinkan, session tidak ditemukan' },
        { status: 401 }
      );
    }


    const userData = await validateSession(token);

    if (!userData) {
      return NextResponse.json(
        { success: false, error: 'Sesi tidak valid atau telah kedaluwarsa' },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true, user: userData });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
