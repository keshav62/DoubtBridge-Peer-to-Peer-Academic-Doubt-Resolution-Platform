import test from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '@/lib/prisma';
import {
  createNotification,
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '@/features/notifications/service';

test('Integration: Notifications & Ownership Enforcement', async (t) => {
  let userA = null;
  let userB = null;
  let notifA = null;
  let notifA2 = null;

  t.before(async () => {
    const ts = Date.now();
    userA = await prisma.user.create({
      data: {
        name: 'Notification User A',
        email: `notif_a_${ts}@doubtbridge.test`,
        role: 'STUDENT',
      },
    });

    userB = await prisma.user.create({
      data: {
        name: 'Notification User B',
        email: `notif_b_${ts}@doubtbridge.test`,
        role: 'STUDENT',
      },
    });
  });

  t.after(async () => {
    const userIds = [userA?.id, userB?.id].filter(Boolean);
    if (userIds.length > 0) {
      await prisma.notification.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }
    await prisma.$disconnect();
  });

  await t.test('Create notifications and verify unread count', async () => {
    notifA = await createNotification({
      userId: userA.id,
      title: 'New Answer Submitted',
      message: 'A peer helper responded to your doubt.',
      type: 'ANSWER_SUBMITTED',
      link: '/doubts/d123',
    });

    notifA2 = await createNotification({
      userId: userA.id,
      title: 'Doubt Resolved',
      message: 'Your doubt was marked as resolved.',
      type: 'DOUBT_RESOLVED',
      link: '/doubts/d123',
    });

    assert.ok(notifA.id);
    assert.ok(notifA2.id);

    const countA = await getUnreadNotificationCount(userA.id);
    assert.equal(countA, 2);

    const countB = await getUnreadNotificationCount(userB.id);
    assert.equal(countB, 0, 'User B must have 0 unread notifications');
  });

  await t.test('Query notifications is strictly isolated to requesting user', async () => {
    const resA = await getNotifications({ userId: userA.id });
    assert.equal(resA.notifications.length, 2);

    const resB = await getNotifications({ userId: userB.id });
    assert.equal(resB.notifications.length, 0);
  });

  await t.test('IDOR prevention: User B cannot mark or delete User A notification', async () => {
    await assert.rejects(
      async () => {
        await markNotificationAsRead(notifA.id, userB.id);
      },
      (err) => err.statusCode === 403 && err.message.includes('Forbidden')
    );

    await assert.rejects(
      async () => {
        await deleteNotification(notifA.id, userB.id);
      },
      (err) => err.statusCode === 403 && err.message.includes('Forbidden')
    );
  });

  await t.test('User A marks one notification as read', async () => {
    const updated = await markNotificationAsRead(notifA.id, userA.id);
    assert.equal(updated.isRead, true);

    const count = await getUnreadNotificationCount(userA.id);
    assert.equal(count, 1);
  });

  await t.test('User A marks all notifications as read', async () => {
    await markAllNotificationsAsRead(userA.id);
    const count = await getUnreadNotificationCount(userA.id);
    assert.equal(count, 0);
  });

  await t.test('User A deletes a notification', async () => {
    const res = await deleteNotification(notifA.id, userA.id);
    assert.equal(res.success, true);

    const remaining = await getNotifications({ userId: userA.id });
    assert.equal(remaining.notifications.length, 1);
  });
});

