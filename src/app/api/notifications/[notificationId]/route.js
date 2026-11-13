import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { deleteNotification } from '@/features/notifications/service';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }

    const { notificationId } = await params;
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Notification not found.' },
        { status: 404 }
      );
    }

    if (notification.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You do not own this notification.' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error('Error fetching notification by ID:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch notification.' },
      { status: error.statusCode || 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }

    const { notificationId } = await params;
    await deleteNotification(notificationId, user.id);

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete notification.' },
      { status: error.statusCode || 500 }
    );
  }
}

