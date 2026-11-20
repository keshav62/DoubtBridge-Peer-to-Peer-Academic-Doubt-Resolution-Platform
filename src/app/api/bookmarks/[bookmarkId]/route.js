import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * DELETE /api/bookmarks/[bookmarkId]
 * Remove a bookmark. Only the owner may delete their own bookmark.
 */
export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { bookmarkId } = await params;
    if (!bookmarkId) {
      return NextResponse.json(
        { success: false, error: 'Bookmark ID is required' },
        { status: 400 }
      );
    }

    // Find the bookmark and verify ownership
    const bookmark = await prisma.bookmark.findUnique({
      where: { id: bookmarkId },
      select: { id: true, userId: true },
    });

    if (!bookmark) {
      return NextResponse.json(
        { success: false, error: 'Bookmark not found' },
        { status: 404 }
      );
    }

    // Only the owner or admin may delete
    if (bookmark.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Permission denied' },
        { status: 403 }
      );
    }

    await prisma.bookmark.delete({ where: { id: bookmarkId } });

    return NextResponse.json({ success: true, message: 'Bookmark removed' });
  } catch (error) {
    console.error('Bookmark DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove bookmark' },
      { status: 500 }
    );
  }
}
