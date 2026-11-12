
import { NextResponse } from 'next/server';
import {
  getDoubts,
  createDoubtRecord,
} from '@/features/doubts/service';
import {
  cleanDoubtInput,
  validateDoubtInput,
} from '@/features/doubts/validation';
import { getCurrentUser } from '@/lib/auth';

// GET: Get all doubts with search, filters and pagination
export async function GET(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status') || undefined;
    const subject = searchParams.get('subject') || undefined;
    const search = searchParams.get('q') || undefined;
    const mine = searchParams.get('mine') === 'true';

    const validStatuses = ['OPEN', 'ASSIGNED', 'CLAIMED', 'ANSWERED', 'RESOLVED', 'CLOSED'];

    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status filter.' },
        { status: 400 }
      );
    }

    const result = await getDoubts({
      studentId: mine ? user.id : undefined,
      status,
      subject,
      search,
      sort: searchParams.get('sort') || undefined,
      limit: searchParams.get('limit') || 20,
      offset: searchParams.get('offset') || 0,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: Create a new doubt
export async function POST(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Please send valid JSON.' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data.' },
        { status: 400 }
      );
    }

    const validation = validateDoubtInput(body);

    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    const data = cleanDoubtInput(body);

    const doubt = await createDoubtRecord(data, user.id);

    return NextResponse.json(
      { success: true, doubt },
      { status: 201 }
    );

  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
