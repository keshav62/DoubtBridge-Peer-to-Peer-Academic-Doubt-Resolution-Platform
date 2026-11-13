import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireRole, ROLES } from '@/lib/permissions';
import { getAdminUsers } from '@/features/admin/service';

// GET /api/admin/users — list users with search, role/status filtering, and pagination
export async function GET(request) {
  try {
    const user = await getCurrentUser();
    requireRole(user, [ROLES.ADMIN]);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || searchParams.get('q') || '';
    const role = searchParams.get('role') || undefined;
    const status = searchParams.get('status') || undefined;
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const result = await getAdminUsers({
      search,
      role,
      status,
      sort,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      users: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch users.' },
      { status: error.status || 500 }
    );
  }
}
