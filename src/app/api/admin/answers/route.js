import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireRole, ROLES } from '@/lib/permissions';
import { getAdminAnswers } from '@/features/admin/service';

// GET /api/admin/answers — Filtered, paginated answers for verification
export async function GET(request) {
  try {
    const user = await getCurrentUser();
    requireRole(user, [ROLES.ADMIN, ROLES.MODERATOR]);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const subject = searchParams.get('subject') || undefined;
    const search = searchParams.get('search') || undefined;
    const queue = searchParams.get('queue') || 'all';
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const result = await getAdminAnswers({
      status,
      subject,
      search,
      queue,
      sort,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch answers for verification.' },
      { status: error.status || 500 }
    );
  }
}
