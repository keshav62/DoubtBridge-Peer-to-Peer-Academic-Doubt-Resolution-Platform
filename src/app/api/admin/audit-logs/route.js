import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireRole, ROLES } from '@/lib/permissions';
import { getAdminAuditLogs } from '@/features/admin/service';

// GET /api/admin/audit-logs — append-only administrative audit history
export async function GET(request) {
  try {
    const user = await getCurrentUser();
    requireRole(user, [ROLES.ADMIN]);

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || undefined;
    const targetType = searchParams.get('targetType') || undefined;
    const actorId = searchParams.get('actorId') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await getAdminAuditLogs({
      action,
      targetType,
      actorId,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      logs: result.logs,
      pagination: result.pagination,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch audit logs.' },
      { status: error.status || 500 }
    );
  }
}
