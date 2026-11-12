import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { acceptAnswerRecord } from '@/features/answers/service';

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

    const result = await acceptAnswerRecord({
      doubtId,
      answerId,
      userId: user.id,
      userRole: user.role,
    });

    return NextResponse.json({
      success: true,
      message: 'Solution accepted successfully!',
      ...result,
    });
  } catch (error) {
    const isForbidden =
      error.message.includes('Only the doubt creator') ||
      error.message.includes('cannot accept your own answer');
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

