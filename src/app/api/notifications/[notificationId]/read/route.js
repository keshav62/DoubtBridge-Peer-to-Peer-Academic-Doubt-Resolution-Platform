import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { markNotificationAsRead } from '@/features/notifications/service';

export async function PATCH(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }

    const { notificationId } = await params;
    const notification = await markNotificationAsRead(notificationId, user.id);

    return NextResponse.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update notification.' },
      { status: error.statusCode || 500 }
    );
  }
}
