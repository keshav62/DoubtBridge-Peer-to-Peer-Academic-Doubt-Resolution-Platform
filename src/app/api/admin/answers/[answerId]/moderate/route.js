import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireRole, ROLES } from '@/lib/permissions';
import { moderateAnswerAdmin } from '@/features/admin/service';

// POST & PATCH /api/admin/answers/[answerId]/moderate — Execute moderation decision
export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser();
    requireRole(user, [ROLES.ADMIN, ROLES.MODERATOR]);

    const { answerId } = await params;
    if (!answerId) {
      return NextResponse.json(
        { success: false, error: 'Answer ID is required.' },
        { status: 400 }
      );
    }

    let body = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request body.' },
        { status: 400 }
      );
    }

    const { decision, feedback } = body || {};

    const result = await moderateAnswerAdmin({
      answerId,
      reviewer: user,
      decision,
      feedback,
    });

    return NextResponse.json({
      success: true,
      message: `Answer ${decision === 'APPROVED' ? 'approved' : decision === 'REJECTED' ? 'rejected' : 'changes requested'} successfully.`,
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to moderate answer.' },
      { status: error.status || 400 }
    );
  }
}

export async function PATCH(request, context) {
  return POST(request, context);
}
