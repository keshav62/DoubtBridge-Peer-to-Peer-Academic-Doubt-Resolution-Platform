import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getHelperProfile, updateHelperProfile, toggleHelperAvailability } from '@/features/helpers/service';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const data = await getHelperProfile(user.id);
    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error('Error in GET /api/helpers/profile:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: error.status || 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updated = await updateHelperProfile(user, body);

    // Fetch refreshed complete profile
    const profileData = await getHelperProfile(user.id);

    return NextResponse.json({
      success: true,
      profile: updated,
      ...profileData,
    });
  } catch (error) {
    console.error('Error in PUT /api/helpers/profile:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update helper profile' },
      { status: error.status || 400 }
    );
  }
}

export async function POST(request) {
  // Support toggle action or standard upsert via POST
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    if (body.action === 'toggle_availability') {
      const result = await toggleHelperAvailability(user);
      return NextResponse.json({ success: true, ...result });
    }

    return PUT(request);
  } catch (error) {
    console.error('Error in POST /api/helpers/profile:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: error.status || 500 }
    );
  }
}
