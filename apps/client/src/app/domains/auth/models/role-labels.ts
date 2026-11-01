import type { UserRole } from '@greyhoarder/domain/users';

/** How a role is shown to users. */
export const ROLE_LABELS: Readonly<Record<UserRole, string>> = { admin: 'Admin', member: 'Member' };
