import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/bookmarks
 * Returns all bookmarks (doubts + resources) for the authenticated user.
 * Query params: type=all|doubts|resources, search, page, limit
 */
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
    const type = searchParams.get('type') || 'all'; // all | doubts | resources
    const search = (searchParams.get('search') || '').trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const baseWhere = { userId: user.id };

    // Filter by type
    if (type === 'doubts') {
      baseWhere.doubtId = { not: null };
      baseWhere.resourceId = null;
    } else if (type === 'resources') {
      baseWhere.resourceId = { not: null };
      baseWhere.doubtId = null;
    }

    // Build search conditions
    let searchConditions = undefined;
    if (search) {
      const searchOR = [];
      if (type !== 'resources') {
        searchOR.push({
          doubt: {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { subject: { contains: search, mode: 'insensitive' } },
            ],
          },
        });
      }
      if (type !== 'doubts') {
        searchOR.push({
          resource: {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { subject: { contains: search, mode: 'insensitive' } },
            ],
          },
        });
      }
      if (searchOR.length > 0) {
        searchConditions = searchOR;
      }
    }

    const where = searchConditions
      ? { AND: [baseWhere, { OR: searchConditions }] }
      : baseWhere;

    const [total, bookmarks] = await Promise.all([
      prisma.bookmark.count({ where }),
      prisma.bookmark.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          doubt: {
            select: {
              id: true,
              title: true,
              description: true,
              subject: true,
              status: true,
              priority: true,
              createdAt: true,
              student: { select: { id: true, name: true, avatar: true, avatarUrl: true } },
              _count: { select: { answers: true } },
            },
          },
          resource: {
            select: {
              id: true,
              title: true,
              description: true,
              subject: true,
              topic: true,
              status: true,
              views: true,
              createdAt: true,
              author: { select: { id: true, name: true, avatar: true, avatarUrl: true } },
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      bookmarks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + bookmarks.length < total,
      },
    });
  } catch (error) {
    console.error('Bookmarks GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load bookmarks' },
      { status: 500 }
    );
  }
}
