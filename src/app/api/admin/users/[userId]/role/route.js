import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireRole, ROLES } from '@/lib/permissions';
import { updateUserRole } from '@/features/admin/service';

// PATCH /api/admin/users/:userId/role — update user role with audit logging
export async function PATCH(request, { params }) {
  try {
    const actor = await getCurrentUser();
    requireRole(actor, [ROLES.ADMIN]);

    const { userId } = await params;
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON.' }, { status: 400 });
    }

    const { role } = body ?? {};
    if (!role) {
      return NextResponse.json({ success: false, error: 'Role is required.' }, { status: 400 });
    }

    const updated = await updateUserRole({
      actor,
      targetUserId: userId,
      newRole: role,
    });

    return NextResponse.json({
      success: true,
      user: updated,
      message: `User role updated to ${role} successfully.`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.status || 500 }
    );
  }
}
