import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/services/seed';

export async function POST() {
  try {
    const result = await seedDatabase();
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SEED-500',
            message: result.message
          }
        },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: { message: result.message },
      error: null,
      meta: {}
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SEED-500',
          message: errorMessage
        }
      },
      { status: 500 }
    );
  }
}
