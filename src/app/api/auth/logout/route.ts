import { NextResponse } from 'next/server';
import { logoutUser } from '@/lib/services/auth';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (token) {
      await logoutUser(token);
    }

    // Hapus cookie session
    cookieStore.delete('session_token');

    return NextResponse.json({ success: true, message: 'Logout berhasil' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
