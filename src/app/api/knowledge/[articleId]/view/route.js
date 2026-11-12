import { NextResponse } from 'next/server';
import { incrementKnowledgeResourceViews } from '@/features/knowledge/service';

export async function POST(request, { params }) {
  try {
    const { articleId } = await params;
    await incrementKnowledgeResourceViews(articleId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error incrementing resource views:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to increment view count' },
      { status: 500 }
    );
  }
}

