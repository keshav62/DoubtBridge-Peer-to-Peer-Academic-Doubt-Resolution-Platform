import { NextResponse } from 'next/server';
import { reviewKnowledgeResource } from '@/features/knowledge/service';
import { validateReviewInput } from '@/features/knowledge/validation';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request, { params }) {
  try {
    const { articleId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = validateReviewInput(body);

    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.errors[0], errors: validation.errors },
        { status: 400 }
      );
    }

    const updated = await reviewKnowledgeResource(articleId, validation.data, user);
    return NextResponse.json({ success: true, resource: updated });
  } catch (error) {
    console.error('Error reviewing knowledge resource:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to review knowledge resource' },
      { status: error.statusCode || 500 }
    );
  }
}

