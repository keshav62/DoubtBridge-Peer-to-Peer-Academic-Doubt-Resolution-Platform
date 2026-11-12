import { NextResponse } from 'next/server';
import {
  getKnowledgeResourceById,
  updateKnowledgeResource,
  deleteKnowledgeResource,
  getRelatedKnowledgeResources,
} from '@/features/knowledge/service';
import { validateKnowledgeInput } from '@/features/knowledge/validation';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const { articleId } = await params;
    const user = await getCurrentUser();

    const resource = await getKnowledgeResourceById(articleId, user);
    if (!resource) {
      return NextResponse.json(
        { success: false, error: 'Knowledge resource not found' },
        { status: 404 }
      );
    }

    const related = await getRelatedKnowledgeResources(articleId, { limit: 3 });

    return NextResponse.json({
      success: true,
      resource,
      related,
    });
  } catch (error) {
    console.error('Error fetching knowledge resource by ID:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch knowledge resource' },
      { status: error.statusCode || 500 }
    );
  }
}

export async function PATCH(request, { params }) {
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
    const validation = validateKnowledgeInput(body, true);

    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.errors[0], errors: validation.errors },
        { status: 400 }
      );
    }

    const updated = await updateKnowledgeResource(articleId, validation.data, user);
    return NextResponse.json({ success: true, resource: updated });
  } catch (error) {
    console.error('Error updating knowledge resource:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update knowledge resource' },
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

    await deleteKnowledgeResource(articleId, user);
    return NextResponse.json({ success: true, message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting knowledge resource:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete knowledge resource' },
      { status: error.statusCode || 500 }
    );
  }
}

