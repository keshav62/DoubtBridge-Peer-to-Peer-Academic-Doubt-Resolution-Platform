import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireRole, ROLES } from '@/lib/permissions';
import { updateUserStatus } from '@/features/admin/service';

// PATCH /api/admin/users/:userId/status — suspend or activate user account with audit logging
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

    const { isActive, suspensionReason } = body ?? {};
    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'isActive boolean flag is required.' },
        { status: 400 }
      );
    }

    const updated = await updateUserStatus({
      actor,
      targetUserId: userId,
      isActive,
      suspensionReason,
    });

    return NextResponse.json({
      success: true,
      user: updated,
      message: isActive ? 'Account activated successfully.' : 'Account suspended successfully.',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.status || 500 }
    );
  }
}

