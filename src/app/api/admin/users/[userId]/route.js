import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireRole, ROLES } from '@/lib/permissions';
import { getAdminUserDetail } from '@/features/admin/service';

// GET /api/admin/users/:userId — detailed user profile for administrators
export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser();
    requireRole(user, [ROLES.ADMIN]);

    const { userId } = await params;
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
    }

    const detail = await getAdminUserDetail(userId);
    if (!detail) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: detail.user,
      auditLogs: detail.auditLogs,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch user details.' },
      { status: error.status || 500 }
    );
  }
}
