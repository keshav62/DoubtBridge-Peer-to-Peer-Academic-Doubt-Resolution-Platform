import { NextResponse } from 'next/server';
import { updateHelperSubjects } from '@/features/helpers/actions';

export async function POST(request) {
  try {
    const body = await request.json();
    const { subjects } = body;

    if (!subjects) {
      return NextResponse.json({ success: false, error: 'Subjects are required' }, { status: 400 });
    }

    const result = await updateHelperSubjects(subjects);
    return NextResponse.json(result);
  } catch (error) {
    let statusCode = 500;
    let errorMessage = 'Server error';

    if (error instanceof SyntaxError) {
      statusCode = 400;
      errorMessage = 'Invalid request format';
    } else if (error.message.includes('Unauthorized')) {
      statusCode = 401;
      errorMessage = error.message;
    } else if (error.message.includes('Forbidden')) {
      statusCode = 403;
      errorMessage = error.message;
    } else if (
      error.message.includes('Subjects must be') ||
      error.message.includes('At least one subject') ||
      error.message.includes('Each subject must be') ||
      error.message.includes('Subjects cannot be empty') ||
      error.message.includes('Duplicate subject')
    ) {
      statusCode = 400;
      errorMessage = error.message;
    }

    return NextResponse.json({ success: false, error: errorMessage }, { status: statusCode });
  }
}
