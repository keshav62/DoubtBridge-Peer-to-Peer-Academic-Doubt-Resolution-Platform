import { NextResponse } from 'next/server';
import { claimDoubtRecord } from '@/features/helpers/service';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request, { params }) {
  try {
    const { doubtId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await claimDoubtRecord(doubtId, user);

    return NextResponse.json({
      success: true,
      ...result,
      message: 'Doubt successfully claimed. You can now assist the student with this question.',
    });
  } catch (error) {
    console.error('Error claiming doubt:', error);
    const status = error.status || 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to claim doubt' },
      { status }
    );
  }
}
