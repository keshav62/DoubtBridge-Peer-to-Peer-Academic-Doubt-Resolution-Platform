
/**
 * Authentication helpers and session resolution
 */

export async function getCurrentUser() {
  // Development user from the seeded database
  return {
    id: 'seed-user-student-1',
    name: 'Alex Rivera',
    email: 'student1@example.com',
    role: 'STUDENT',
    reputation: 150,
  };
}

export function isAuthenticated(user) {
  return Boolean(user && user.id);
}
