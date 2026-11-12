import { NextResponse } from 'next/server';
import { getUserBookmarkedResources } from '@/features/knowledge/service';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit'), 10) : 20;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset'), 10) : 0;

    const result = await getUserBookmarkedResources(user, { limit, offset });

    return NextResponse.json({
      success: true,
      resources: result.resources,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Error fetching user bookmarked resources:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch bookmarks' },
      { status: error.statusCode || 500 }
    );
  }
}

