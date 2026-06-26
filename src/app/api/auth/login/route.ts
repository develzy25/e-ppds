import { NextRequest, NextResponse } from 'next/server';
import { loginUser, hashPassword } from '@/lib/services/auth';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { email, password, pondokId } = await req.json();

    if (!email || !password || !pondokId) {
      return NextResponse.json(
        { success: false, error: 'Email, password, dan Pondok ID wajib diisi' },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(password);
    const token = await loginUser(email, passwordHash, pondokId);

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Kredensial login tidak valid' },
        { status: 401 }
      );
    }

    // Atur HttpOnly Cookie untuk Session Token
    const cookieStore = await cookies();
    cookieStore.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 jam
      path: '/',
    });

    return NextResponse.json({ success: true, token });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
