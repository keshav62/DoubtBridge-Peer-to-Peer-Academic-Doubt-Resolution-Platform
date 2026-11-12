import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDashboardAnalytics } from '@/features/dashboard/service';

export async function GET(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const days = searchParams.get('days') ? parseInt(searchParams.get('days'), 10) : 30;
    const scope = searchParams.get('scope') || 'global';

    const data = await getDashboardAnalytics({
      days,
      scope,
      user,
    });

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error('Error in GET /api/dashboard/analytics:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

