/**
 * Knowledge Resource Validation & Sanitization
 */

export function sanitizeString(val) {
  if (typeof val !== 'string') return '';
  return val.trim();
}

export function validateKnowledgeInput(data, isUpdate = false) {
  const errors = [];
  const sanitized = {};

  if (!isUpdate || data.title !== undefined) {
    const title = sanitizeString(data.title);
    if (!title || title.length < 5) {
      errors.push('Title must be at least 5 characters long');
    } else if (title.length > 200) {
      errors.push('Title cannot exceed 200 characters');
    }
    sanitized.title = title;
  }

  if (!isUpdate || data.subject !== undefined) {
    const subject = sanitizeString(data.subject);
    if (!subject) {
      errors.push('Subject is required');
    } else if (subject.length > 100) {
      errors.push('Subject cannot exceed 100 characters');
    }
    sanitized.subject = subject;
  }

  if (data.topic !== undefined) {
    const topic = sanitizeString(data.topic);
    if (topic.length > 100) {
      errors.push('Topic cannot exceed 100 characters');
    }
    sanitized.topic = topic || null;
  }

  if (data.description !== undefined) {
    const description = sanitizeString(data.description);
    if (description && description.length > 500) {
      errors.push('Description cannot exceed 500 characters');
    }
    sanitized.description = description || null;
  }

  if (!isUpdate || data.content !== undefined) {
    const content = sanitizeString(data.content);
    if (!content || content.length < 20) {
      errors.push('Content must be at least 20 characters long');
    }
    sanitized.content = content;
  }

  if (data.sourceUrl !== undefined) {
    const sourceUrl = sanitizeString(data.sourceUrl);
    if (sourceUrl) {
      try {
        new URL(sourceUrl);
        sanitized.sourceUrl = sourceUrl;
      } catch {
        errors.push('Source URL must be a valid URL');
      }
    } else {
      sanitized.sourceUrl = null;
    }
  }

  if (data.status !== undefined) {
    const allowedStatuses = ['DRAFT', 'PENDING'];
    if (!allowedStatuses.includes(data.status)) {
      errors.push('Status must be DRAFT or PENDING upon submission');
    } else {
      sanitized.status = data.status;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: sanitized,
  };
}

export function validateReviewInput(data) {
  const errors = [];
  const decision = sanitizeString(data.decision).toUpperCase();
  const feedback = sanitizeString(data.feedback);

  if (!['APPROVED', 'REJECTED'].includes(decision)) {
    errors.push('Decision must be APPROVED or REJECTED');
  }

  if (decision === 'REJECTED' && !feedback) {
    errors.push('Feedback is required when rejecting a resource');
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: {
      decision,
      feedback: feedback || null,
    },
  };
}

