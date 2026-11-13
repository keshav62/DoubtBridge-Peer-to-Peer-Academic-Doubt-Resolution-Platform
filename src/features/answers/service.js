import { prisma } from '@/lib/prisma';
import {
  notifyAnswerSubmitted,
  notifyAnswerApproved,
  notifyAnswerRejected,
  notifyAnswerAccepted,
} from '@/features/notifications/service';

/**
 * Common select fields for answer authors to protect private user data.
 */
const authorSelect = {
  id: true,
  name: true,
  role: true,
  reputation: true,
  avatar: true,
  avatarUrl: true,
  department: true,
};

/**
 * Common select fields for moderation reviews.
 */
const reviewSelect = {
  id: true,
  decision: true,
  feedback: true,
  reviewedAt: true,
  reviewer: {
    select: {
      id: true,
      name: true,
      role: true,
    },
  },
};

/**
 * Create a new answer for a doubt.
 * Enforces validation, initial PENDING status, and updates helper stats if applicable.
 */
export async function createAnswerRecord({ doubtId, authorId, content }) {
  if (!doubtId || typeof doubtId !== 'string') {
    throw new Error('Doubt ID is required.');
  }

  const cleanContent = typeof content === 'string' ? content.trim() : '';
  if (!cleanContent || cleanContent.length < 5) {
    throw new Error('Answer content must be at least 5 characters.');
  }
  if (cleanContent.length > 10000) {
    throw new Error('Answer content cannot exceed 10,000 characters.');
  }

  return prisma.$transaction(
    async (tx) => {
      // 1. Verify doubt exists and can receive answers
      const doubt = await tx.doubt.findUnique({
        where: { id: doubtId },
        select: { id: true, title: true, studentId: true, status: true },
      });

      if (!doubt) {
        throw new Error('Doubt not found.');
      }

      if (doubt.status === 'CLOSED') {
        throw new Error('Cannot submit answers to a closed doubt.');
      }

      // 2. Create answer and update helper stats concurrently
      const [answer] = await Promise.all([
        tx.answer.create({
          data: {
            doubtId,
            authorId,
            content: cleanContent,
            status: 'PENDING',
          },
          include: {
            author: { select: authorSelect },
            reviews: {
              select: reviewSelect,
              orderBy: { reviewedAt: 'desc' },
            },
          },
        }),
        tx.helperProfile.updateMany({
          where: { userId: authorId },
          data: { totalAnswers: { increment: 1 } },
        }),
      ]);

      // 3. Atomically notify the doubt owner if not the author
      await notifyAnswerSubmitted(
        { doubt, authorName: answer.author?.name, actorId: authorId },
        tx
      );

      return answer;
    },
    { maxWait: 10000, timeout: 20000 }
  );
}

/**
 * Accept an approved answer for a doubt.
 * Executes atomically inside a Prisma transaction:
 * 1. Verifies doubt ownership or admin permissions.
 * 2. Verifies answer belongs to doubt and is APPROVED.
 * 3. Prevents author self-acceptance (unless admin).
 * 4. Ensures no conflicting accepted answer exists.
 * 5. Marks answer as accepted and doubt as RESOLVED.
 * 6. Rewards helper reputation (+25) and increments acceptedAnswers count.
 */
export async function acceptAnswerRecord({ doubtId, answerId, userId, userRole }) {
  if (!doubtId || !answerId) {
    throw new Error('Both doubtId and answerId are required.');
  }

  return prisma.$transaction(
    async (tx) => {
      // 1. Concurrently fetch both the doubt and the target answer
      const [doubt, answer] = await Promise.all([
        tx.doubt.findUnique({
          where: { id: doubtId },
          include: {
            answers: {
              where: { isAccepted: true },
              select: { id: true },
            },
          },
        }),
        tx.answer.findUnique({
          where: { id: answerId },
          include: {
            author: { select: authorSelect },
          },
        }),
      ]);

      if (!doubt) {
        throw new Error('Doubt not found.');
      }

      if (!answer) {
        throw new Error('Answer not found.');
      }

      // 2. Authorization check: Only doubt owner or ADMIN can accept
      const isOwner = doubt.studentId === userId;
      const isAdmin = userRole === 'ADMIN';
      if (!isOwner && !isAdmin) {
        throw new Error('Only the doubt creator or an administrator can accept an answer.');
      }

      // 3. Prevent multiple accepted answers
      if (doubt.answers.length > 0 || doubt.status === 'RESOLVED') {
        throw new Error('This doubt already has an accepted solution.');
      }

      if (answer.doubtId !== doubtId) {
        throw new Error('Answer does not belong to the specified doubt.');
      }

      // 4. Must be APPROVED before acceptance
      if (answer.status !== 'APPROVED') {
        throw new Error('Only approved answers can be accepted as solutions.');
      }

      // 5. Prevent self-acceptance unless admin
      if (answer.authorId === userId && !isAdmin) {
        throw new Error('You cannot accept your own answer.');
      }

      // 6. Execute updates concurrently within transaction
      const [updatedAnswer, updatedDoubt] = await Promise.all([
        tx.answer.update({
          where: { id: answerId },
          data: { isAccepted: true },
          include: {
            author: { select: authorSelect },
            reviews: {
              select: reviewSelect,
              orderBy: { reviewedAt: 'desc' },
            },
          },
        }),
        tx.doubt.update({
          where: { id: doubtId },
          data: {
            status: 'RESOLVED',
            resolvedAt: new Date(),
          },
        }),
        tx.user.update({
          where: { id: answer.authorId },
          data: { reputation: { increment: 25 } },
        }),
        tx.helperProfile.updateMany({
          where: { userId: answer.authorId },
          data: {
            reputation: { increment: 25 },
            acceptedAnswers: { increment: 1 },
          },
        }),
        tx.doubtAssignment.updateMany({
          where: {
            doubtId,
            helperId: answer.authorId,
            status: 'ACTIVE',
          },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        }),
      ]);

      // 7. Atomically notify answer author (+15 rep award)
      await notifyAnswerAccepted(
        { answer, doubtTitle: doubt.title, doubtId, actorId: userId },
        tx
      );

      return {
        success: true,
        answer: updatedAnswer,
        doubt: updatedDoubt,
      };
    },
    { maxWait: 10000, timeout: 20000 }
  );
}

/**
 * Review an answer (approve or reject) by a moderator or admin.
 * Executes atomically inside a Prisma transaction:
 * 1. Verifies reviewer permissions (MODERATOR or ADMIN).
 * 2. Prevents self-moderation (cannot review own answer).
 * 3. Creates a ModerationReview record.
 * 4. Updates answer status.
 * 5. If approved, transitions OPEN or CLAIMED doubt to ANSWERED.
 */
export async function moderateAnswerRecord({
  doubtId,
  answerId,
  reviewerId,
  reviewerRole,
  decision,
  feedback,
}) {
  if (!answerId || !decision) {
    throw new Error('answerId and decision are required.');
  }

  const validDecisions = ['APPROVED', 'REJECTED', 'NEEDS_CHANGES'];
  if (!validDecisions.includes(decision)) {
    throw new Error(`Invalid decision. Must be one of: ${validDecisions.join(', ')}`);
  }

  const isModerator = reviewerRole === 'MODERATOR' || reviewerRole === 'ADMIN';
  if (!isModerator) {
    throw new Error('Only moderators or administrators can review answers.');
  }

  return prisma.$transaction(
    async (tx) => {
      const answer = await tx.answer.findUnique({
        where: { id: answerId },
        select: {
          id: true,
          authorId: true,
          doubtId: true,
          doubt: { select: { id: true, title: true } },
        },
      });

      if (!answer) {
        throw new Error('Answer not found.');
      }

      if (doubtId && answer.doubtId !== doubtId) {
        throw new Error('Answer does not belong to the specified doubt.');
      }

      // Self-moderation prevention
      if (answer.authorId === reviewerId) {
        throw new Error('Moderators cannot review their own answers.');
      }

      let targetStatus = 'PENDING';
      if (decision === 'APPROVED') targetStatus = 'APPROVED';
      if (decision === 'REJECTED') targetStatus = 'REJECTED';

      const [review, updatedAnswer] = await Promise.all([
        tx.moderationReview.create({
          data: {
            answerId,
            reviewerId,
            decision,
            feedback: typeof feedback === 'string' ? feedback.trim() : null,
          },
          select: reviewSelect,
        }),
        tx.answer.update({
          where: { id: answerId },
          data: { status: targetStatus },
          include: {
            author: { select: authorSelect },
            reviews: {
              select: reviewSelect,
              orderBy: { reviewedAt: 'desc' },
            },
          },
        }),
        decision === 'APPROVED'
          ? tx.doubt.updateMany({
              where: {
                id: answer.doubtId,
                status: { in: ['OPEN', 'ASSIGNED', 'CLAIMED'] },
              },
              data: { status: 'ANSWERED' },
            })
          : Promise.resolve(),
      ]);

      // Atomically notify the answer author of moderation outcome
      if (decision === 'APPROVED') {
        await notifyAnswerApproved(
          {
            answer,
            doubtTitle: answer.doubt?.title,
            doubtId: answer.doubtId,
            actorId: reviewerId,
          },
          tx
        );
      } else if (decision === 'REJECTED') {
        await notifyAnswerRejected(
          {
            answer,
            doubtTitle: answer.doubt?.title,
            doubtId: answer.doubtId,
            feedback,
            actorId: reviewerId,
          },
          tx
        );
      }

      return {
        success: true,
        answer: updatedAnswer,
        review,
      };
    },
    { maxWait: 10000, timeout: 20000 }
  );
}

/**
 * Increment upvotes for an answer.
 */
export async function upvoteAnswerRecord(answerId) {
  if (!answerId) throw new Error('Answer ID is required.');

  const updated = await prisma.answer.update({
    where: { id: answerId },
    data: { upvotes: { increment: 1 } },
    select: { id: true, upvotes: true },
  });

  return { success: true, upvotes: updated.upvotes };
}
