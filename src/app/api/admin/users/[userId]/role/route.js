import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { requireRole, canChangeUserRole, ROLES } from '@/lib/permissions';

const ALLOWED_ROLES = Object.values(ROLES);

// PATCH /api/admin/users/:userId/role — change a user's role (admin only)
export async function PATCH(request, { params }) {
  try {
    const actor = await getCurrentUser();
    requireRole(actor, [ROLES.ADMIN]);

    const { userId } = await params;

    if (!canChangeUserRole(actor, userId)) {
      return NextResponse.json(
        { success: false, error: 'You cannot change your own role.' },
        { status: 403 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON.' }, { status: 400 });
    }

    const { role } = body ?? {};

    if (!role || !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json(
        { success: false, error: `Role must be one of: ${ALLOWED_ROLES.join(', ')}.` },
        { status: 400 }
      );
    }

    const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!target) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.status || 500 }
    );
  }
}
