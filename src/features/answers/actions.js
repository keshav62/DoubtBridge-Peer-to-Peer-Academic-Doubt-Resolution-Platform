import { getCurrentUser } from '@/lib/auth';
import {
  createAnswerRecord,
  acceptAnswerRecord,
  moderateAnswerRecord,
  upvoteAnswerRecord,
} from './service';

export async function createAnswerAction(doubtId, content) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const answer = await createAnswerRecord({
    doubtId,
    authorId: user.id,
    content,
  });

  return { success: true, answer };
}

export async function acceptAnswerAction(doubtId, answerId) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  return acceptAnswerRecord({
    doubtId,
    answerId,
    userId: user.id,
    userRole: user.role,
  });
}

export async function moderateAnswerAction({ doubtId, answerId, decision, feedback }) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  return moderateAnswerRecord({
    doubtId,
    answerId,
    reviewerId: user.id,
    reviewerRole: user.role,
    decision,
    feedback,
  });
}

export async function upvoteAnswerAction(answerId) {
  return upvoteAnswerRecord(answerId);
}
