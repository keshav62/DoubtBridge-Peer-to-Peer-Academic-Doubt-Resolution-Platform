import { prisma } from '@/lib/prisma';
import { canEditKnowledge, canDeleteKnowledge, canReviewKnowledge, ROLES } from '@/lib/permissions';

/**
 * Retrieve knowledge resources / articles with filtering, search, sorting, and pagination.
 */
export async function getKnowledgeResources({
  q,
  search,
  subject,
  topic,
  status,
  sort = 'newest',
  authorId,
  bookmarkedBy,
  limit = 12,
  offset = 0,
  user,
} = {}) {
  const searchTerm = (q || search || '').trim();
  const where = {};

  // Status filtering & authorization visibility:
  // Public users can only see APPROVED resources.
  // Authors can see their own resources of any status if authorId matches.
  // Moderators and Admins can see requested statuses.
  const isPrivileged = user && (user.role === ROLES.MODERATOR || user.role === ROLES.ADMIN);
  const isOwnContent = user && authorId && user.id === authorId;

  if (status) {
    if (status === 'APPROVED') {
      where.status = 'APPROVED';
    } else if (isPrivileged || isOwnContent) {
      where.status = status;
    } else {
      where.status = 'APPROVED';
    }
  } else if (!isPrivileged && !isOwnContent) {
    where.status = 'APPROVED';
  }

  if (subject && subject !== 'All') {
    where.subject = { equals: subject, mode: 'insensitive' };
  }

  if (topic) {
    where.topic = { contains: topic, mode: 'insensitive' };
  }

  if (authorId) {
    where.authorId = authorId;
  }

  if (bookmarkedBy) {
    where.bookmarks = {
      some: {
        userId: bookmarkedBy,
      },
    };
  }

  if (searchTerm) {
    where.OR = [
      { title: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } },
      { content: { contains: searchTerm, mode: 'insensitive' } },
      { subject: { contains: searchTerm, mode: 'insensitive' } },
      { topic: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  let orderBy = [{ createdAt: 'desc' }];
  if (sort === 'oldest') {
    orderBy = [{ createdAt: 'asc' }];
  } else if (sort === 'views' || sort === 'popular') {
    orderBy = [{ views: 'desc' }, { createdAt: 'desc' }];
  } else if (sort === 'title') {
    orderBy = [{ title: 'asc' }];
  }

  const [total, resources] = await Promise.all([
    prisma.knowledgeResource.count({ where }),
    prisma.knowledgeResource.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
            reputation: true,
            avatar: true,
            avatarUrl: true,
          },
        },
        bookmarks: user?.id
          ? {
              where: { userId: user.id },
              select: { id: true },
            }
          : false,
        _count: {
          select: {
            bookmarks: true,
          },
        },
      },
      orderBy,
      take: Math.min(Number(limit) || 12, 50),
      skip: Math.max(Number(offset) || 0, 0),
    }),
  ]);

  const formattedResources = resources.map((r) => ({
    ...r,
    isBookmarked: Boolean(r.bookmarks && r.bookmarks.length > 0),
    bookmarksCount: r._count?.bookmarks || 0,
    bookmarks: undefined,
    _count: undefined,
  }));

  return {
    resources: formattedResources,
    pagination: {
      total,
      limit: Number(limit),
      offset: Number(offset),
      hasMore: offset + resources.length < total,
    },
  };
}

/**
 * Retrieve a single knowledge resource by ID with authorization verification.
 */
export async function getKnowledgeResourceById(id, user) {
  if (!id) return null;

  const resource = await prisma.knowledgeResource.findUnique({
    where: { id },
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
      bookmarks: user?.id
        ? {
            where: { userId: user.id },
            select: { id: true },
          }
        : false,
      _count: {
        select: {
          bookmarks: true,
        },
      },
    },
  });

  if (!resource) return null;

  // Authorization: if not APPROVED, only author or Moderator/Admin can access
  if (resource.status !== 'APPROVED') {
    const isOwner = user && user.id === resource.authorId;
    const isPrivileged = user && (user.role === ROLES.MODERATOR || user.role === ROLES.ADMIN);
    if (!isOwner && !isPrivileged) {
      const error = new Error('You do not have permission to view this unpublished resource.');
      error.statusCode = 403;
      throw error;
    }
  }

  return {
    ...resource,
    isBookmarked: Boolean(resource.bookmarks && resource.bookmarks.length > 0),
    bookmarksCount: resource._count?.bookmarks || 0,
    bookmarks: undefined,
    _count: undefined,
  };
}

/**
 * Create a new knowledge resource (defaults to PENDING or DRAFT).
 */
export async function createKnowledgeResource(data, user) {
  if (!user || !user.id) {
    const error = new Error('Authentication required.');
    error.statusCode = 401;
    throw error;
  }

  const resource = await prisma.knowledgeResource.create({
    data: {
      title: data.title,
      description: data.description || null,
      content: data.content,
      subject: data.subject,
      topic: data.topic || null,
      sourceUrl: data.sourceUrl || null,
      status: data.status === 'DRAFT' ? 'DRAFT' : 'PENDING',
      authorId: user.id,
      views: 0,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          role: true,
          reputation: true,
        },
      },
    },
  });

  return resource;
}

/**
 * Update an existing knowledge resource.
 */
export async function updateKnowledgeResource(id, data, user) {
  if (!user || !user.id) {
    const error = new Error('Authentication required.');
    error.statusCode = 401;
    throw error;
  }

  const existing = await prisma.knowledgeResource.findUnique({
    where: { id },
  });

  if (!existing) {
    const error = new Error('Resource not found.');
    error.statusCode = 404;
    throw error;
  }

  if (!canEditKnowledge(user, existing)) {
    const error = new Error('You do not have permission to edit this resource.');
    error.statusCode = 403;
    throw error;
  }

  const updateData = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.subject !== undefined) updateData.subject = data.subject;
  if (data.topic !== undefined) updateData.topic = data.topic;
  if (data.sourceUrl !== undefined) updateData.sourceUrl = data.sourceUrl;

  // If status is supplied and valid
  if (data.status && ['DRAFT', 'PENDING'].includes(data.status)) {
    updateData.status = data.status;
  } else if (existing.status === 'REJECTED' && data.status === 'PENDING') {
    updateData.status = 'PENDING';
  }

  return prisma.knowledgeResource.update({
    where: { id },
    data: updateData,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          role: true,
          reputation: true,
        },
      },
    },
  });
}

/**
 * Delete a knowledge resource.
 */
export async function deleteKnowledgeResource(id, user) {
  if (!user || !user.id) {
    const error = new Error('Authentication required.');
    error.statusCode = 401;
    throw error;
  }

  const existing = await prisma.knowledgeResource.findUnique({
    where: { id },
  });

  if (!existing) {
    const error = new Error('Resource not found.');
    error.statusCode = 404;
    throw error;
  }

  if (!canDeleteKnowledge(user, existing)) {
    const error = new Error('You do not have permission to delete this resource.');
    error.statusCode = 403;
    throw error;
  }

  await prisma.knowledgeResource.delete({
    where: { id },
  });

  return { success: true };
}

/**
 * Safely increment view count for a knowledge resource.
 */
export async function incrementKnowledgeResourceViews(id) {
  if (!id) return null;
  return prisma.knowledgeResource.update({
    where: { id },
    data: { views: { increment: 1 } },
  });
}

/**
 * Toggle bookmark for a knowledge resource.
 */
export async function toggleResourceBookmark(resourceId, user) {
  if (!user || !user.id) {
    const error = new Error('Authentication required to bookmark resources.');
    error.statusCode = 401;
    throw error;
  }

  const resource = await prisma.knowledgeResource.findUnique({
    where: { id: resourceId },
  });

  if (!resource) {
    const error = new Error('Resource not found.');
    error.statusCode = 404;
    throw error;
  }

  // Check if bookmark exists
  const existing = await prisma.bookmark.findUnique({
    where: {
      userId_resourceId: {
        userId: user.id,
        resourceId,
      },
    },
  });

  if (existing) {
    await prisma.bookmark.delete({
      where: { id: existing.id },
    });
    return { bookmarked: false, resourceId };
  }

  await prisma.bookmark.create({
    data: {
      userId: user.id,
      resourceId,
    },
  });

  return { bookmarked: true, resourceId };
}

/**
 * Retrieve user's bookmarked resources.
 */
export async function getUserBookmarkedResources(user, { limit = 20, offset = 0 } = {}) {
  if (!user || !user.id) {
    const error = new Error('Authentication required.');
    error.statusCode = 401;
    throw error;
  }

  const where = {
    userId: user.id,
    resourceId: { not: null },
    resource: {
      status: 'APPROVED',
    },
  };

  const [total, bookmarks] = await Promise.all([
    prisma.bookmark.count({ where }),
    prisma.bookmark.findMany({
      where,
      include: {
        resource: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                role: true,
                reputation: true,
                avatar: true,
                avatarUrl: true,
              },
            },
            _count: {
              select: { bookmarks: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Number(limit) || 20, 50),
      skip: Math.max(Number(offset) || 0, 0),
    }),
  ]);

  const resources = bookmarks.map((b) => ({
    ...b.resource,
    isBookmarked: true,
    bookmarksCount: b.resource._count?.bookmarks || 0,
    bookmarkedAt: b.createdAt,
    _count: undefined,
  }));

  return {
    resources,
    pagination: {
      total,
      limit: Number(limit),
      offset: Number(offset),
      hasMore: offset + resources.length < total,
    },
  };
}

/**
 * Retrieve resources waiting in moderation queue (PENDING).
 */
export async function getPendingKnowledgeResources(user, { limit = 20, offset = 0 } = {}) {
  if (!user || (user.role !== ROLES.MODERATOR && user.role !== ROLES.ADMIN)) {
    const error = new Error('Moderator or Admin permissions required.');
    error.statusCode = 403;
    throw error;
  }

  const where = { status: 'PENDING' };

  const [total, resources] = await Promise.all([
    prisma.knowledgeResource.count({ where }),
    prisma.knowledgeResource.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
            reputation: true,
            avatar: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: Math.min(Number(limit) || 20, 50),
      skip: Math.max(Number(offset) || 0, 0),
    }),
  ]);

  return {
    resources,
    pagination: {
      total,
      limit: Number(limit),
      offset: Number(offset),
      hasMore: offset + resources.length < total,
    },
  };
}

/**
 * Review a pending knowledge resource (APPROVE or REJECT).
 */
export async function reviewKnowledgeResource(resourceId, { decision, feedback }, user) {
  if (!user || (user.role !== ROLES.MODERATOR && user.role !== ROLES.ADMIN)) {
    const error = new Error('Moderator or Admin permissions required.');
    error.statusCode = 403;
    throw error;
  }

  const resource = await prisma.knowledgeResource.findUnique({
    where: { id: resourceId },
  });

  if (!resource) {
    const error = new Error('Resource not found.');
    error.statusCode = 404;
    throw error;
  }

  if (!canReviewKnowledge(user, resource)) {
    const error = new Error('Authors cannot review their own submissions.');
    error.statusCode = 403;
    throw error;
  }

  const updated = await prisma.knowledgeResource.update({
    where: { id: resourceId },
    data: {
      status: decision === 'APPROVED' ? 'APPROVED' : 'REJECTED',
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });

  // Create notification for author
  try {
    await prisma.notification.create({
      data: {
        userId: resource.authorId,
        title: `Knowledge Resource ${decision === 'APPROVED' ? 'Approved' : 'Needs Review'}`,
        message:
          decision === 'APPROVED'
            ? `Your resource "${resource.title}" was approved and is now live in the Knowledge Hub.`
            : `Your resource "${resource.title}" was reviewed: ${feedback || 'Please update and resubmit.'}`,
        type: 'MODERATION_DECISION',
      },
    });
  } catch (err) {
    // Non-blocking notification failure
    console.error('Failed to dispatch notification:', err);
  }

  return updated;
}

/**
 * Retrieve related knowledge resources based on matching subject and topic.
 */
export async function getRelatedKnowledgeResources(resourceId, { limit = 3 } = {}) {
  const current = await prisma.knowledgeResource.findUnique({
    where: { id: resourceId },
    select: { id: true, subject: true, topic: true },
  });

  if (!current) return [];

  const OR = [{ subject: current.subject }];
  if (current.topic) {
    OR.push({ topic: { contains: current.topic, mode: 'insensitive' } });
  }

  const related = await prisma.knowledgeResource.findMany({
    where: {
      id: { not: resourceId },
      status: 'APPROVED',
      OR,
    },
    include: {
      author: {
        select: { id: true, name: true, role: true },
      },
    },
    orderBy: [{ views: 'desc' }, { createdAt: 'desc' }],
    take: limit,
  });

  return related;
}

/**
 * Aggregate distinct subjects and their counts of approved resources.
 */
export async function getKnowledgeSubjectsAndCounts() {
  const counts = await prisma.knowledgeResource.groupBy({
    by: ['subject'],
    where: { status: 'APPROVED' },
    _count: {
      id: true,
    },
  });

  return counts.map((c) => ({
    subject: c.subject,
    count: c._count.id,
  }));
}

/**
 * Backward-compatible helper functions for legacy KnowledgeArticle queries.
 */
export async function getKnowledgeArticles({ subject, search, limit = 20 } = {}) {
  const result = await getKnowledgeResources({ subject, search, limit });
  return result.resources;
}

export async function createKnowledgeArticle(data) {
  return createKnowledgeResource(data, { id: data.authorId });
}

export async function incrementArticleViews(articleId) {
  return incrementKnowledgeResourceViews(articleId);
}
