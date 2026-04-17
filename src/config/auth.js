/**
 * Auth configuration — password-to-team mapping.
 * Add new entries to TEAM_PASSWORDS to grant access to additional teams.
 */

export const TEAM_PASSWORDS = {
  '6051fc84a7a0d74c225fb18a496b09952da5642e60723ecae543298edd7d82d6': 'Admin',
  'be0e40c88a58a7ab3e7a0227cd28d498c9672810442cc2edb600b896fa9299d4': 'Customer Success',
  'f12792f9746489582b0d4b627338856f9f0871853b757f0baa7096dd5d1bbf86': 'Sales',
  '7e070743aeba56a6a6ced1647ef2927888037f7e7d3074ff4d29b1828daa3913': 'Product',
  '3574735fec88e4b189df9e0595944922b5bfd96eb098440f4c6f508964381c2d': 'Leadership',
};

/** Session duration in milliseconds (12 hours). */
export const SESSION_DURATION_MS = 12 * 60 * 60 * 1000;

/** localStorage key for the auth session. */
export const STORAGE_KEY = 'aio-utilization-auth';
