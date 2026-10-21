import type { User } from '@greyhoarder/domain/users';

/**
 * Read-only access to users, without side effects (CQS). Published through
 * `users/api`; never add a writing method here.
 */
export abstract class UserQueries {
  abstract findById(id: string): Promise<User | undefined>;

  /** Matches the username regardless of case. */
  abstract findByUsername(username: string): Promise<User | undefined>;

  abstract hasAny(): Promise<boolean>;
}
