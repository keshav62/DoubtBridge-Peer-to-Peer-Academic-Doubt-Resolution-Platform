import { prisma } from '@/lib/prisma';

/**
 * Core notification creation function.
 * Supports passing an optional Prisma transaction client `tx` for atomic integration.
 */
export async function createNotification(
  { userId, title, message, type = 'SYSTEM', link = null },
  tx = null
) {
  if (!userId || !title || !message) {
    return null;
  }

  const client = tx || prisma;

  return client.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      link,
      isRead: false,
    },
  });
}

/**
 * Retrieve paginated notifications for a specific user with filtering.
 */
export async function getNotifications({
  userId,
  page = 1,
  limit = 10,
  read = undefined,
  type = undefined,
}) {
  if (!userId) {
    return { notifications: [], pagination: { total: 0, page: 1, limit, totalPages: 0, hasMore: false }, unreadCount: 0 };
  }

  const take = Math.min(Math.max(Number(limit) || 10, 1), 50);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const where = { userId };
  if (read !== undefined && read !== null && read !== '') {
    where.isRead = read === true || read === 'true';
  }
  if (type) {
    where.type = type;
  }

  const [total, unreadCount, notifications] = await Promise.all([
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, isRead: false } }),
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    }),
  ]);

  const totalPages = Math.ceil(total / take) || 1;

  return {
    notifications,
    pagination: {
      total,
      page: Number(page) || 1,
      limit: take,
      totalPages,
      hasMore: skip + notifications.length < total,
    },
    unreadCount,
  };
}

/**
 * Get unread notification count for a user.
 */
export async function getUnreadNotificationCount(userId) {
  if (!userId) return 0;
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
}

/**
 * Mark a single notification as read, enforcing user ownership.
 */
export async function markNotificationAsRead(notificationId, userId) {
  if (!notificationId || !userId) {
    const error = new Error('Invalid parameters');
    error.statusCode = 400;
    throw error;
  }

  const existing = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!existing) {
    const error = new Error('Notification not found');
    error.statusCode = 404;
    throw error;
  }

  if (existing.userId !== userId) {
    const error = new Error('Forbidden: You do not own this notification');
    error.statusCode = 403;
    throw error;
  }

  if (existing.isRead) {
    return existing; // Idempotent update
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

/**
 * Mark all notifications as read for a user.
 */
export async function markAllNotificationsAsRead(userId) {
  if (!userId) return { count: 0 };

  const result = await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  return { count: result.count };
}

/**
 * Delete a single notification, enforcing ownership.
 */
export async function deleteNotification(notificationId, userId) {
  if (!notificationId || !userId) {
    const error = new Error('Invalid parameters');
    error.statusCode = 400;
    throw error;
  }

  const existing = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!existing) {
    const error = new Error('Notification not found');
    error.statusCode = 404;
    throw error;
  }

  if (existing.userId !== userId) {
    const error = new Error('Forbidden: You do not own this notification');
    error.statusCode = 403;
    throw error;
  }

  await prisma.notification.delete({
    where: { id: notificationId },
  });

  return { success: true };
}

/* ========================================================================= */
/* WORKFLOW NOTIFICATION DISPATCHERS                                        */
/* Enforce recipient resolution, actor self-exclusion & transaction safety   */
/* ========================================================================= */

/**
 * 1. New Answer Submitted -> Notify Doubt Owner
 */
export async function notifyAnswerSubmitted({ doubt, authorName, actorId }, tx = null) {
  if (!doubt || !doubt.studentId || doubt.studentId === actorId) {
    return null; // Never notify user about their own action
  }

  return createNotification(
    {
      userId: doubt.studentId,
      title: 'New Answer Submitted',
      message: `${authorName || 'A peer helper'} submitted an answer to your doubt "${doubt.title}".`,
      type: 'ANSWER_SUBMITTED',
      link: `/doubts/${doubt.id}`,
    },
    tx
  );
}

/**
 * 2. Answer Approved -> Notify Answer Author
 */
export async function notifyAnswerApproved({ answer, doubtTitle, doubtId, actorId }, tx = null) {
  if (!answer || !answer.authorId || answer.authorId === actorId) {
    return null;
  }

  return createNotification(
    {
      userId: answer.authorId,
      title: 'Answer Approved',
      message: `Your answer on "${doubtTitle || 'academic doubt'}" was approved by a moderator.`,
      type: 'MODERATION_DECISION',
      link: `/doubts/${doubtId || answer.doubtId}`,
    },
    tx
  );
}

/**
 * 3. Answer Rejected -> Notify Answer Author with Feedback
 */
export async function notifyAnswerRejected({ answer, doubtTitle, doubtId, feedback, actorId }, tx = null) {
  if (!answer || !answer.authorId || answer.authorId === actorId) {
    return null;
  }

  return createNotification(
    {
      userId: answer.authorId,
      title: 'Answer Needs Revision',
      message: `Your answer on "${doubtTitle || 'academic doubt'}" was reviewed: ${feedback || 'Please review guidelines and resubmit.'}`,
      type: 'MODERATION_DECISION',
      link: `/doubts/${doubtId || answer.doubtId}`,
    },
    tx
  );
}

/**
 * 4. Answer Accepted as Solution -> Notify Answer Author (+15 rep)
 */
export async function notifyAnswerAccepted({ answer, doubtTitle, doubtId, actorId }, tx = null) {
  if (!answer || !answer.authorId || answer.authorId === actorId) {
    return null;
  }

  return createNotification(
    {
      userId: answer.authorId,
      title: 'Solution Accepted (+15 Rep)',
      message: `Your answer on "${doubtTitle || 'academic doubt'}" was marked as the accepted solution! You earned +15 reputation.`,
      type: 'DOUBT_RESOLVED',
      link: `/doubts/${doubtId || answer.doubtId}`,
    },
    tx
  );
}

/**
 * 5. Doubt Claimed / Assigned -> Notify Doubt Owner & Assigned Helper
 */
export async function notifyDoubtClaimed({ doubt, helperName, helperId, actorId }, tx = null) {
  if (!doubt || !doubt.studentId || doubt.studentId === actorId) {
    return null;
  }

  return createNotification(
    {
      userId: doubt.studentId,
      title: 'Helper Assigned',
      message: `${helperName || 'A peer helper'} claimed your doubt "${doubt.title}" and is working on a solution.`,
      type: 'DOUBT_CREATED',
      link: `/doubts/${doubt.id}`,
    },
    tx
  );
}

/**
 * 6. Assignment Cancelled -> Notify Relevant Doubt Owner
 */
export async function notifyAssignmentCancelled({ doubt, helperName, actorId }, tx = null) {
  if (!doubt || !doubt.studentId || doubt.studentId === actorId) {
    return null;
  }

  return createNotification(
    {
      userId: doubt.studentId,
      title: 'Assignment Released',
      message: `Helper ${helperName || ''} released the assignment on your doubt "${doubt.title}". It is now open to other peers.`,
      type: 'SYSTEM',
      link: `/doubts/${doubt.id}`,
    },
    tx
  );
}

/**
 * 7. Assignment Completed -> Notify Relevant Doubt Owner
 */
export async function notifyAssignmentCompleted({ doubt, helperName, actorId }, tx = null) {
  if (!doubt || !doubt.studentId || doubt.studentId === actorId) {
    return null;
  }

  return createNotification(
    {
      userId: doubt.studentId,
      title: 'Doubt Resolved by Helper',
      message: `Helper ${helperName || ''} marked your doubt "${doubt.title}" as completed.`,
      type: 'DOUBT_RESOLVED',
      link: `/doubts/${doubt.id}`,
    },
    tx
  );
}

/**
 * 8. Knowledge Resource Approved -> Notify Author
 */
export async function notifyResourceApproved({ resource, actorId }, tx = null) {
  if (!resource || !resource.authorId || resource.authorId === actorId) {
    return null;
  }

  return createNotification(
    {
      userId: resource.authorId,
      title: 'Academic Resource Approved',
      message: `Your guide "${resource.title}" was approved and is now live in the Knowledge Hub.`,
      type: 'MODERATION_DECISION',
      link: `/knowledge/${resource.id}`,
    },
    tx
  );
}

/**
 * 9. Knowledge Resource Rejected -> Notify Author
 */
export async function notifyResourceRejected({ resource, feedback, actorId }, tx = null) {
  if (!resource || !resource.authorId || resource.authorId === actorId) {
    return null;
  }

  return createNotification(
    {
      userId: resource.authorId,
      title: 'Resource Needs Revision',
      message: `Your resource "${resource.title}" was reviewed: ${feedback || 'Please update and resubmit.'}`,
      type: 'MODERATION_DECISION',
      link: `/knowledge/${resource.id}`,
    },
    tx
  );
}
