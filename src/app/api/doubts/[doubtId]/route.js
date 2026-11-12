
import { NextResponse } from 'next/server';
import {
  getDoubtById,
  updateDoubtRecord,
  deleteDoubtRecord,
} from '@/features/doubts/service';
import {
  cleanDoubtInput,
  validateDoubtInput,
} from '@/features/doubts/validation';
import { getCurrentUser } from '@/lib/auth';

// GET: Get one doubt with its answers
export async function GET(request, { params }) {
  try {
    const { doubtId } = await params;

    if (!doubtId || typeof doubtId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Doubt ID is required.' },
        { status: 400 }
      );
    }

    const currentUser = await getCurrentUser();
    const doubt = await getDoubtById(doubtId, currentUser);

    if (!doubt) {
      return NextResponse.json(
        { success: false, error: 'Doubt not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      doubt,
      currentUser: currentUser
        ? {
            id: currentUser.id,
            name: currentUser.name,
            role: currentUser.role,
            reputation: currentUser.reputation,
          }
        : null,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH: Update an existing doubt
export async function PATCH(request, { params }) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { doubtId } = await params;
    const existing = await getDoubtById(doubtId);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Doubt not found.' },
        { status: 404 }
      );
    }

    // Only the owner can edit the doubt
    if (existing.studentId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'You can edit only your own doubts.' },
        { status: 403 }
      );
    }

    // Only OPEN doubts can be edited
    if (existing.status !== 'OPEN') {
      return NextResponse.json(
        { success: false, error: 'Only open doubts can be edited.' },
        { status: 400 }
      );
    }

    const body = await request.json();

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data.' },
        { status: 400 }
      );
    }

    // Keep existing values when a field is not provided
    const data = {
      title: body.title ?? existing.title,
      description: body.description ?? existing.description,
      subject: body.subject ?? existing.subject,
      tags: body.tags ?? existing.tags,
      urgency: body.urgency ?? existing.urgency,
    };

    const validation = validateDoubtInput(data);

    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    const cleanedData = cleanDoubtInput(data);

    const updated = await updateDoubtRecord(
      doubtId,
      user.id,
      cleanedData
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Doubt could not be updated.' },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true, doubt: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Delete an existing doubt
export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { doubtId } = await params;
    const doubt = await getDoubtById(doubtId);

    if (!doubt) {
      return NextResponse.json(
        { success: false, error: 'Doubt not found.' },
        { status: 404 }
      );
    }

    // Only the owner can delete the doubt
    if (doubt.studentId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'You can delete only your own doubts.' },
        { status: 403 }
      );
    }

    // Only OPEN doubts can be deleted
    if (doubt.status !== 'OPEN') {
      return NextResponse.json(
        { success: false, error: 'Only open doubts can be deleted.' },
        { status: 400 }
      );
    }

    const deleted = await deleteDoubtRecord(doubtId, user.id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Doubt could not be deleted.' },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Doubt deleted successfully.',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
