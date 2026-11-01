import type { User, UserRole } from '@greyhoarder/domain/users';
import type { UserCredentials } from '../models/user-credentials.js';

/** What changes on a profile: a field left out stays, one set to `undefined` is removed. */
export type ProfileChanges = Partial<Pick<User, 'displayName' | 'language' | 'avatarId'>>;

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

  /**
   * Stores a further account.
   *
   * @throws UsernameTakenError when the name is taken, whatever its case
   */
  abstract create(username: string, role: UserRole, passwordHash: string): Promise<void>;

  abstract changePasswordHash(id: string, passwordHash: string): Promise<void>;

  /** @returns the user as stored afterwards */
  abstract updateProfile(id: string, changes: ProfileChanges): Promise<User>;

  /** @returns the user as stored afterwards */
  abstract updateAccount(id: string, changes: Partial<Pick<User, 'role' | 'disabled'>>): Promise<User>;

  abstract recordLogin(id: string, at: Date): Promise<void>;

  abstract remove(id: string): Promise<void>;
}
