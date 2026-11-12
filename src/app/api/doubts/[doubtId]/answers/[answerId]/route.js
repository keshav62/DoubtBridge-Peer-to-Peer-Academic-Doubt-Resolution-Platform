import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  acceptAnswerRecord,
  moderateAnswerRecord,
  upvoteAnswerRecord,
} from '@/features/answers/service';

export async function PATCH(request, { params }) {
  try {
    const { doubtId, answerId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const action = body?.action;

    if (action === 'accept') {
      const result = await acceptAnswerRecord({
        doubtId,
        answerId,
        userId: user.id,
        userRole: user.role,
      });
      return NextResponse.json({ success: true, ...result });
    }

    if (action === 'review') {
      const result = await moderateAnswerRecord({
        doubtId,
        answerId,
        reviewerId: user.id,
        reviewerRole: user.role,
        decision: body.decision,
        feedback: body.feedback,
      });
      return NextResponse.json({ success: true, ...result });
    }

    if (action === 'upvote') {
      const result = await upvoteAnswerRecord(answerId);
      return NextResponse.json({ success: true, ...result });
    }

    return NextResponse.json(
      { success: false, error: `Unsupported action: ${action}` },
      { status: 400 }
    );
  } catch (error) {
    const isForbidden =
      error.message.includes('Only') ||
      error.message.includes('cannot accept your own answer') ||
      error.message.includes('cannot review their own');
    const isNotFound = error.message.includes('not found');

    return NextResponse.json(
      { success: false, error: error.message },
      { status: isForbidden ? 403 : isNotFound ? 404 : 400 }
    );
  }
}

