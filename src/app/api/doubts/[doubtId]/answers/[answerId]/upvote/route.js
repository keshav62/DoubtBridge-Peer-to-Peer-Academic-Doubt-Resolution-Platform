import { NextResponse } from 'next/server';
import { upvoteAnswerRecord } from '@/features/answers/service';

export async function POST(request, { params }) {
  try {
    const { answerId } = await params;
    const result = await upvoteAnswerRecord(answerId);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

