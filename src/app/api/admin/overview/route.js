import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireRole, ROLES } from '@/lib/permissions';
import { getAdminOverview } from '@/features/admin/service';

// GET /api/admin/overview — platform control center summary metrics
export async function GET() {
  try {
    const user = await getCurrentUser();
    requireRole(user, [ROLES.ADMIN]);

    const data = await getAdminOverview();

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch platform metrics.' },
      { status: error.status || 500 }
    );
  }
}

