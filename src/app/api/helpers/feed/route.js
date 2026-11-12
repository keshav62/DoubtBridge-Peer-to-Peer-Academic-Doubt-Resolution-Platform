import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getRecommendedDoubtsForHelper } from '@/features/helpers/matching';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Load full user record including helperProfile and subjects
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { helperProfile: true },
    });

    if (!fullUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject') || '';
    const topic = searchParams.get('topic') || '';
    const urgency = searchParams.get('urgency') || '';
    const difficulty = searchParams.get('difficulty') || '';
    const sort = searchParams.get('sort') || 'best_match';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit'), 10) : 20;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset'), 10) : 0;

    const data = await getRecommendedDoubtsForHelper(fullUser, {
      subject,
      topic,
      urgency,
      difficulty,
      sort,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error('Error in GET /api/helpers/feed:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
