import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireRole, ROLES } from '@/lib/permissions';
import { getAdminModerationAnalytics } from '@/features/admin/service';

// GET /api/admin/analytics/moderation — Moderation metrics, approval rates & activity
export async function GET() {
  try {
    const user = await getCurrentUser();
    requireRole(user, [ROLES.ADMIN, ROLES.MODERATOR]);

    const data = await getAdminModerationAnalytics();

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch moderation analytics.' },
      { status: error.status || 500 }
    );
  }
}
