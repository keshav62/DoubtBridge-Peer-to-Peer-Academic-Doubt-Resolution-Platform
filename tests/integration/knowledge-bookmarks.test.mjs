import test from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '@/lib/prisma';
import {
  createKnowledgeResource,
  reviewKnowledgeResource,
  toggleResourceBookmark,
  getUserBookmarkedResources,
} from '@/features/knowledge/service';

test('Integration: Knowledge Hub & Bookmarks Lifecycle', async (t) => {
  let authorStudent = null;
  let moderator = null;
  let readerStudent = null;
  let resource = null;

  t.before(async () => {
    const ts = Date.now();
    authorStudent = await prisma.user.create({
      data: {
        name: 'Knowledge Author',
        email: `author_${ts}@doubtbridge.test`,
        role: 'STUDENT',
      },
    });

    moderator = await prisma.user.create({
      data: {
        name: 'Knowledge Moderator',
        email: `kh_mod_${ts}@doubtbridge.test`,
        role: 'MODERATOR',
      },
    });

    readerStudent = await prisma.user.create({
      data: {
        name: 'Knowledge Reader',
        email: `reader_${ts}@doubtbridge.test`,
        role: 'STUDENT',
      },
    });
  });

  t.after(async () => {
    if (resource) {
      await prisma.bookmark.deleteMany({ where: { resourceId: resource.id } });
      await prisma.knowledgeResource.deleteMany({ where: { id: resource.id } });
    }
    const userIds = [authorStudent?.id, moderator?.id, readerStudent?.id].filter(Boolean);
    if (userIds.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }
    await prisma.$disconnect();
  });

  await t.test('Author creates a DRAFT knowledge resource', async () => {
    resource = await createKnowledgeResource(
      {
        title: 'Mastering Dynamic Programming with Tabulation',
        description: 'Complete guide to solving DP problems iteratively.',
        content: '# Dynamic Programming\n\nTabulation is bottom-up DP...',
        subject: 'Algorithms',
        topic: 'Dynamic Programming',
        status: 'DRAFT',
      },
      authorStudent
    );

    assert.ok(resource.id);
    assert.equal(resource.status, 'DRAFT');
    assert.equal(resource.authorId, authorStudent.id);
  });

  await t.test('Author updates status to PENDING for moderation review', async () => {
    const pendingResource = await prisma.knowledgeResource.update({
      where: { id: resource.id },
      data: { status: 'PENDING' },
    });
    assert.equal(pendingResource.status, 'PENDING');
  });

  await t.test('Author cannot self-review their own submission', async () => {
    await assert.rejects(
      async () => {
        await reviewKnowledgeResource(resource.id, { decision: 'APPROVED' }, authorStudent);
      },
      (err) => err.statusCode === 403 || err.message.includes('cannot review')
    );
  });

  await t.test('Moderator approves the knowledge resource', async () => {
    const reviewed = await reviewKnowledgeResource(resource.id, { decision: 'APPROVED' }, moderator);
    assert.equal(reviewed.status, 'APPROVED');
  });

  await t.test('Reader bookmarks the resource and retrieves it', async () => {
    const bookmarkRes = await toggleResourceBookmark(resource.id, readerStudent);
    assert.equal(bookmarkRes.bookmarked, true);

    const saved = await getUserBookmarkedResources(readerStudent, { limit: 10, offset: 0 });
    assert.equal(saved.resources.length, 1);
    assert.equal(saved.resources[0].id, resource.id);
  });

  await t.test('Reader un-bookmarks the resource', async () => {
    const toggleOff = await toggleResourceBookmark(resource.id, readerStudent);
    assert.equal(toggleOff.bookmarked, false);

    const savedEmpty = await getUserBookmarkedResources(readerStudent, { limit: 10, offset: 0 });
    assert.equal(savedEmpty.resources.length, 0);
  });
});

