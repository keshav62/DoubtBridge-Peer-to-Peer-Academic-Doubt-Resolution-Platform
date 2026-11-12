/**
 * Input validation and sanitization for Helper Profile and Assignment operations.
 */

export function sanitizeString(val) {
  if (typeof val !== 'string') return '';
  return val.trim().replace(/[<>]/g, '');
}

export function sanitizeSubjects(subjectsInput) {
  if (!subjectsInput) return '';

  let list = [];
  if (Array.isArray(subjectsInput)) {
    list = subjectsInput;
  } else if (typeof subjectsInput === 'string') {
    list = subjectsInput.split(',');
  }

  const cleaned = list
    .map((s) => sanitizeString(s))
    .filter((s) => s.length > 0 && s.length <= 100)
    .slice(0, 20); // max 20 subjects

  return cleaned.join(',');
}

export function validateHelperProfileInput(data = {}) {
  const errors = {};

  const bio = data.bio !== undefined ? sanitizeString(data.bio) : undefined;
  if (bio !== undefined && bio.length > 1000) {
    errors.bio = 'Biography must not exceed 1,000 characters.';
  }

  const subjects = data.subjects !== undefined ? sanitizeSubjects(data.subjects) : undefined;

  const expertise = data.expertise !== undefined ? sanitizeString(data.expertise) : undefined;
  if (expertise !== undefined && expertise.length > 500) {
    errors.expertise = 'Expertise description must not exceed 500 characters.';
  }

  const isAvailable =
    data.isAvailable !== undefined ? Boolean(data.isAvailable) : undefined;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: {
      bio,
      subjects,
      expertise,
      isAvailable,
    },
  };
}

export function validateAssignmentAction(action) {
  const validActions = ['CANCEL', 'COMPLETE'];
  const upper = String(action || '').toUpperCase();
  if (!validActions.includes(upper)) {
    return {
      isValid: false,
      error: `Invalid assignment action "${action}". Allowed: ${validActions.join(', ')}.`,
      action: null,
    };
  }
  return { isValid: true, action: upper };
}
