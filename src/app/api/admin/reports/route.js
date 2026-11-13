import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireRole, ROLES } from '@/lib/permissions';
import { getAdminReports } from '@/features/admin/service';

// GET /api/admin/reports — list user reports for administrators
export async function GET(request) {
  try {
    const user = await getCurrentUser();
    requireRole(user, [ROLES.ADMIN]);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const result = await getAdminReports({
      status,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      reports: result.reports,
      pagination: result.pagination,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch reports.' },
      { status: error.status || 500 }
    );
  }
}

