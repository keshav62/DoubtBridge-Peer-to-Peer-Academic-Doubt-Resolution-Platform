import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getHelperAssignments } from '@/features/helpers/service';

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'ALL';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit'), 10) : 30;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset'), 10) : 0;

    const data = await getHelperAssignments(user, {
      status,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error('Error in GET /api/helpers/assignments:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

