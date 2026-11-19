import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: Get all answers by the current authenticated user
export async function GET(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Verify user is a helper
    if (user.role !== 'HELPER') {
      return NextResponse.json(
        { success: false, error: 'Only helpers can view their solutions' },
        { status: 403 }
      );
    }

    // Get total count
    const total = await prisma.answer.count({
      where: { authorId: user.id },
    });

    // Get answers with pagination
    const answers = await prisma.answer.findMany({
      where: { authorId: user.id },
      include: {
        doubt: {
          select: {
            id: true,
            title: true,
            subject: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return NextResponse.json({
      success: true,
      answers,
      total,
      limit,
      offset,
    });

  } catch (error) {
    console.error('Error fetching user answers:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
