/**
 * Auth configuration — password-to-team mapping.
 * Add new entries to TEAM_PASSWORDS to grant access to additional teams.
 */

export const TEAM_PASSWORDS = {
  'admin2026':      'Admin',
  'success2026':    'Customer Success',
  'sales2026':      'Sales',
  'product2026':    'Product',
  'leadership2026': 'Leadership',
};

/** Session duration in milliseconds (12 hours). */
export const SESSION_DURATION_MS = 12 * 60 * 60 * 1000;

/** localStorage key for the auth session. */
export const STORAGE_KEY = 'aio-utilization-auth';
