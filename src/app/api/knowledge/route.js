import { NextResponse } from 'next/server';
import {
  getKnowledgeResources,
  createKnowledgeResource,
  getKnowledgeSubjectsAndCounts,
} from '@/features/knowledge/service';
import { validateKnowledgeInput } from '@/features/knowledge/validation';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);

    const q = searchParams.get('q') || searchParams.get('search') || undefined;
    const subject = searchParams.get('subject') || undefined;
    const topic = searchParams.get('topic') || undefined;
    const status = searchParams.get('status') || undefined;
    const sort = searchParams.get('sort') || 'newest';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit'), 10) : 12;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset'), 10) : 0;
    const mine = searchParams.get('mine') === 'true';

    const [result, subjects] = await Promise.all([
      getKnowledgeResources({
        q,
        subject,
        topic,
        status,
        sort,
        limit,
        offset,
        authorId: mine && user ? user.id : undefined,
        user,
      }),
      getKnowledgeSubjectsAndCounts(),
    ]);

    return NextResponse.json({
      success: true,
      resources: result.resources,
      pagination: result.pagination,
      subjects,
    });
  } catch (error) {
    console.error('Error fetching knowledge resources:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch knowledge resources' },
      { status: error.statusCode || 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to submit resources' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = validateKnowledgeInput(body);

    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.errors[0], errors: validation.errors },
        { status: 400 }
      );
    }

    const resource = await createKnowledgeResource(validation.data, user);
    return NextResponse.json({ success: true, resource }, { status: 201 });
  } catch (error) {
    console.error('Error creating knowledge resource:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create knowledge resource' },
      { status: error.statusCode || 500 }
    );
  }
}
