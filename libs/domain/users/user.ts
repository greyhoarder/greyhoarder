export const userRoles = ['admin', 'member'] as const;

/** `admin` manages users and instance settings; `member` does not (ADR-0007). */
export type UserRole = (typeof userRoles)[number];

/** A user account as both apps see it. Passwords never appear here. */
export interface User {
  id: string;
  username: string;
  role: UserRole;
  disabled: boolean;
}
