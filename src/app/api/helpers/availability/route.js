import { NextResponse } from 'next/server';
import { toggleHelperAvailability } from '@/features/helpers/actions';

export async function POST(request) {
  try {
    const result = await toggleHelperAvailability();
    return NextResponse.json(result);
  } catch (error) {
    let statusCode = 500;
    if (error.message.includes('Unauthorized')) {
      statusCode = 401;
    } else if (error.message.includes('Forbidden')) {
      statusCode = 403;
    }
    return NextResponse.json({ success: false, error: error.message }, { status: statusCode });
  }
}
