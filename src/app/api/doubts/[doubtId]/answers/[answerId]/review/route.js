import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { moderateAnswerRecord } from '@/features/answers/service';

export async function POST(request, { params }) {
  try {
    const { doubtId, answerId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const isModerator = user.role === 'MODERATOR' || user.role === 'ADMIN';
    if (!isModerator) {
      return NextResponse.json(
        { success: false, error: 'Only moderators or administrators can review answers.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { decision, feedback } = body || {};

    const result = await moderateAnswerRecord({
      doubtId,
      answerId,
      reviewerId: user.id,
      reviewerRole: user.role,
      decision,
      feedback,
    });

    return NextResponse.json({
      success: true,
      message: `Answer ${decision.toLowerCase()} successfully.`,
      ...result,
    });
  } catch (error) {
    const isForbidden =
      error.message.includes('Only moderators') ||
      error.message.includes('cannot review their own');
    const isNotFound = error.message.includes('not found');

    return NextResponse.json(
      { success: false, error: error.message },
      { status: isForbidden ? 403 : isNotFound ? 404 : 400 }
    );
  }
}

export async function PATCH(request, context) {
  return POST(request, context);
}

