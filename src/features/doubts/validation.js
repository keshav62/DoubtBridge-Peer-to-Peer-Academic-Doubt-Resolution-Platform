
/**
 * Validation rules for creating and editing a doubt.
 * Used by API routes and server actions.
 */

const VALID_URGENCIES = ['LOW', 'MEDIUM', 'HIGH'];

export function validateDoubtInput(data = {}) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    data = {};
  }

  const errors = {};

  // Validate title
  if (typeof data.title !== 'string' || data.title.trim().length < 5) {
    errors.title = 'Title must be at least 5 characters long.';
  } else if (data.title.trim().length > 150) {
    errors.title = 'Title cannot be longer than 150 characters.';
  }

  // Validate description
  if (typeof data.description !== 'string' || data.description.trim().length < 15) {
    errors.description = 'Description must be at least 15 characters long.';
  } else if (data.description.trim().length > 5000) {
    errors.description = 'Description cannot be longer than 5000 characters.';
  }

  // Validate subject
  if (typeof data.subject !== 'string' || !data.subject.trim()) {
    errors.subject = 'Please select an academic subject.';
  } else if (data.subject.trim().length > 80) {
    errors.subject = 'Subject cannot be longer than 80 characters.';
  }

  // Validate urgency
  if (data.urgency && !VALID_URGENCIES.includes(data.urgency)) {
    errors.urgency = 'Please select a valid urgency.';
  }

  // Validate tags
  if (data.tags && typeof data.tags !== 'string') {
    errors.tags = 'Tags must be text.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Clean input before saving
export function cleanDoubtInput(data = {}) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    data = {};
  }

  return {
    title: typeof data.title === 'string' ? data.title.trim() : '',
    description: typeof data.description === 'string' ? data.description.trim() : '',
    subject: typeof data.subject === 'string' ? data.subject.trim() : '',
    tags: typeof data.tags === 'string' ? data.tags.trim() : '',
    urgency: data.urgency || 'MEDIUM',
  };
}
