import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { updateAssignmentStatus } from '@/features/helpers/service';

export async function PATCH(request, { params }) {
  try {
    const { assignmentId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const action = body.action || body.status;

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required ("CANCEL" or "COMPLETE").' },
        { status: 400 }
      );
    }

    const result = await updateAssignmentStatus(assignmentId, user, action);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error in PATCH /api/helpers/assignments/[assignmentId]:', error);
    const status = error.status || 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update assignment' },
      { status }
    );
  }
}
