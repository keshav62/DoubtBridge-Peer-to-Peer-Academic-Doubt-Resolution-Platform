import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH: Update answer content
export async function PATCH(request, { params }) {
  try {
    const { answerId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    const cleanContent = content.trim();
    if (cleanContent.length < 5) {
      return NextResponse.json(
        { success: false, error: 'Answer content must be at least 5 characters' },
        { status: 400 }
      );
    }

    if (cleanContent.length > 10000) {
      return NextResponse.json(
        { success: false, error: 'Answer content cannot exceed 10,000 characters' },
        { status: 400 }
      );
    }

    // Verify the answer exists and belongs to the current user
    const answer = await prisma.answer.findUnique({
      where: { id: answerId },
      select: {
        id: true,
        authorId: true,
        doubtId: true,
      },
    });

    if (!answer) {
      return NextResponse.json(
        { success: false, error: 'Answer not found' },
        { status: 404 }
      );
    }

    // Ownership validation: Only the answer author can edit
    if (answer.authorId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'You can only edit your own answers' },
        { status: 403 }
      );
    }

    // Update the answer
    const updatedAnswer = await prisma.answer.update({
      where: { id: answerId },
      data: {
        content: cleanContent,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        content: true,
        updatedAt: true,
        status: true,
        isAccepted: true,
        upvotes: true,
        doubt: {
          select: {
            id: true,
            title: true,
            subject: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      answer: updatedAnswer,
    });

  } catch (error) {
    console.error('Error updating answer:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
