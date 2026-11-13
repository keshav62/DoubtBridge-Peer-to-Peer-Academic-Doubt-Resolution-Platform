import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireRole, ROLES } from '@/lib/permissions';
import { getAdminModerationOverview } from '@/features/admin/service';

// GET /api/admin/moderation — unified moderation overview (answers, resources, reports)
export async function GET(request) {
  try {
    const user = await getCurrentUser();
    requireRole(user, [ROLES.ADMIN]);

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const result = await getAdminModerationOverview({
      type,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch moderation queue.' },
      { status: error.status || 500 }
    );
  }
}

