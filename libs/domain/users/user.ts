export const userRoles = ['admin', 'member'] as const;

/** `admin` manages users and instance settings; `member` does not (ADR-0007). */
export type UserRole = (typeof userRoles)[number];

export const languages = ['en', 'de'] as const;

/** Stored with the account; the app stays in English until translations exist. */
export type Language = (typeof languages)[number];

export const DISPLAY_NAME_MAX_LENGTH = 50;

/** The most a picture of a user may weigh, in bytes. */
export const AVATAR_MAX_BYTES = 64 * 1024;

/** A user account as both apps see it. Passwords never appear here. */
export interface User {
  id: string;
  username: string;
  role: UserRole;
  disabled: boolean;
  /** Shown instead of the username; signing in stays with the username. */
  displayName?: string;
  /** English while none was chosen. */
  language?: Language;
  /** Names the user's picture and changes with it; none while there is no picture. */
  avatarId?: string;
  /** ISO moment. */
  createdAt?: string;
  /** ISO moment; none before the first sign-in that was recorded. */
  lastLoginAt?: string;
}

/** Whether the instance would have no active administrator without this account. */
export function isLastActiveAdministrator(account: User, accounts: readonly User[]): boolean {
  const isActiveAdministrator = (user: User) => user.role === 'admin' && !user.disabled;
  return isActiveAdministrator(account) && accounts.filter(isActiveAdministrator).length === 1;
}

/** The name a user is shown by. */
export function shownName(user: Pick<User, 'username' | 'displayName'>): string {
  return user.displayName ?? user.username;
}
