import type { UserCredentials } from './user-credentials.js';

/** Storage of users for the features of this domain; never published through `users/api`. */
export abstract class UserRepository {
  /** Matches the username regardless of case. */
  abstract findCredentials(username: string): Promise<UserCredentials | undefined>;

  /**
   * Stores the first account with the role `admin`; atomic, so of two
   * concurrent calls only one succeeds.
   *
   * @throws AccountsAlreadyExistError once any account exists or the setup ran before
   */
  abstract createInitialAdmin(username: string, passwordHash: string): Promise<void>;
}
