import { NextResponse } from 'next/server';
import { getHelpersDirectory } from '@/features/helpers/service';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject') || '';
    const availableOnly = searchParams.get('available') === 'true';
    const search = searchParams.get('q') || '';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit'), 10) : 30;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset'), 10) : 0;

    const data = await getHelpersDirectory({
      subject,
      availableOnly,
      search,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error('Error in GET /api/helpers:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
