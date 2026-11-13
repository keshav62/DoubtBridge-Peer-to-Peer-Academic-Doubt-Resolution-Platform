import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { markAllNotificationsAsRead } from '@/features/notifications/service';

export async function PATCH() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }

    const result = await markAllNotificationsAsRead(user.id);
    return NextResponse.json({
      success: true,
      message: 'All notifications marked as read.',
      count: result.count,
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update notifications.' },
      { status: error.statusCode || 500 }
    );
  }
}
