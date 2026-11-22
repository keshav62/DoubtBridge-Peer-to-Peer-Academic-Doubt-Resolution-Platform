import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireRole, ROLES } from '@/lib/permissions';
import { getAdminAnswerDetail } from '@/features/admin/service';

// GET /api/admin/answers/[answerId] — Detailed answer record with doubt & review history
export async function GET(request, { params }) {
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

    const answer = await getAdminAnswerDetail(answerId);
    if (!answer) {
      return NextResponse.json(
        { success: false, error: 'Answer not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      answer,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch answer details.' },
      { status: error.status || 500 }
    );
  }
}
