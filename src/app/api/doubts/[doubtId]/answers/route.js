import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createAnswerRecord } from '@/features/answers/service';

// GET: List answers for a specific doubt with moderation visibility rules applied
export async function GET(request, { params }) {
  try {
    const { doubtId } = await params;
    if (!doubtId) {
      return NextResponse.json(
        { success: false, error: 'Doubt ID is required.' },
        { status: 400 }
      );
    }

    const doubt = await prisma.doubt.findUnique({
      where: { id: doubtId },
      select: { id: true, studentId: true },
    });

    if (!doubt) {
      return NextResponse.json(
        { success: false, error: 'Doubt not found.' },
        { status: 404 }
      );
    }

    const currentUser = await getCurrentUser();
    const isModeratorOrAdmin =
      currentUser && (currentUser.role === 'MODERATOR' || currentUser.role === 'ADMIN');
    const isDoubtOwner = currentUser && currentUser.id === doubt.studentId;

    const allAnswers = await prisma.answer.findMany({
      where: { doubtId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
            reputation: true,
            avatar: true,
            avatarUrl: true,
            department: true,
          },
        },
        reviews: {
          select: {
            id: true,
            decision: true,
            feedback: true,
            reviewedAt: true,
            reviewer: {
              select: { id: true, name: true, role: true },
            },
          },
          orderBy: { reviewedAt: 'desc' },
        },
      },
      orderBy: [
        { isAccepted: 'desc' },
        { upvotes: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    // Filter answers according to RBAC and moderation rules
    const answers = allAnswers.filter((ans) => {
      if (ans.status === 'APPROVED') return true;
      if (isModeratorOrAdmin) return true;
      if (currentUser && ans.authorId === currentUser.id) return true;
      if (isDoubtOwner && ans.status === 'PENDING') return true;
      return false;
    });

    return NextResponse.json({
      success: true,
      answers,
      currentUser: currentUser
        ? {
            id: currentUser.id,
            name: currentUser.name,
            role: currentUser.role,
            reputation: currentUser.reputation,
          }
        : null,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: Submit a new answer for this doubt
export async function POST(request, { params }) {
  try {
    const { doubtId } = await params;
    if (!doubtId) {
      return NextResponse.json(
        { success: false, error: 'Doubt ID is required.' },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in to answer.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const content = body?.content;

    if (!content || typeof content !== 'string' || content.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: 'Answer content must be at least 5 characters.' },
        { status: 400 }
      );
    }

    if (content.trim().length > 10000) {
      return NextResponse.json(
        { success: false, error: 'Answer content cannot exceed 10,000 characters.' },
        { status: 400 }
      );
    }

    const answer = await createAnswerRecord({
      doubtId,
      authorId: user.id,
      content,
    });

    return NextResponse.json(
      {
        success: true,
        answer,
        message: 'Your answer was submitted successfully and is pending moderation review.',
      },
      { status: 201 }
    );
  } catch (error) {
    const isNotFoundError = error.message.includes('not found');
    const isClosedError = error.message.includes('closed');

    return NextResponse.json(
      { success: false, error: error.message },
      { status: isNotFoundError ? 404 : isClosedError ? 400 : 500 }
    );
  }
}
