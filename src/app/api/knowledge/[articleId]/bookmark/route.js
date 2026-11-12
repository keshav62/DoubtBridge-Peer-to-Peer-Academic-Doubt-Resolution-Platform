import { NextResponse } from 'next/server';
import { toggleResourceBookmark } from '@/features/knowledge/service';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request, { params }) {
  try {
    const { articleId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to bookmark resources' },
        { status: 401 }
      );
    }

    const result = await toggleResourceBookmark(articleId, user);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Error toggling resource bookmark:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update bookmark' },
      { status: error.statusCode || 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { articleId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const result = await toggleResourceBookmark(articleId, user);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Error removing resource bookmark:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to remove bookmark' },
      { status: error.statusCode || 500 }
    );
  }
}

