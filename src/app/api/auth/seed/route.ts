import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/services/seed';

export async function POST() {
  try {
    const result = await seedDatabase();
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true, message: result.message });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
