import type { UserCredentials } from './user-credentials.js';

/** Storage of users for the features of this domain; never published through `users/api`. */
export abstract class UserRepository {
  /** Matches the username regardless of case. */
  abstract findCredentials(username: string): Promise<UserCredentials | undefined>;
}
