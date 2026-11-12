import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDashboardOverview } from '@/features/dashboard/service';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await getDashboardOverview({ user });

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error('Error in GET /api/dashboard/overview:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

