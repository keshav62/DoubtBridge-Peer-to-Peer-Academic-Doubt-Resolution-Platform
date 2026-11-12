import { NextResponse } from 'next/server';
import { getPendingKnowledgeResources } from '@/features/knowledge/service';
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

    const result = await getPendingKnowledgeResources(user, { limit, offset });

    return NextResponse.json({
      success: true,
      resources: result.resources,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Error fetching pending knowledge resources:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch pending resources' },
      { status: error.statusCode || 500 }
    );
  }
}

