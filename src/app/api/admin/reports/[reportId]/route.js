import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireRole, ROLES } from '@/lib/permissions';
import { reviewAdminReport } from '@/features/admin/service';

// PATCH /api/admin/reports/:reportId — mark report reviewed or dismissed with notes
export async function PATCH(request, { params }) {
  try {
    const actor = await getCurrentUser();
    requireRole(actor, [ROLES.ADMIN]);

    const { reportId } = await params;
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON.' }, { status: 400 });
    }

    const { status, resolutionNotes } = body ?? {};
    if (!status) {
      return NextResponse.json({ success: false, error: 'Status is required.' }, { status: 400 });
    }

    const updated = await reviewAdminReport({
      actor,
      reportId,
      status,
      resolutionNotes,
    });

    return NextResponse.json({
      success: true,
      report: updated,
      message: `Report status updated to ${status}.`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.status || 500 }
    );
  }
}

