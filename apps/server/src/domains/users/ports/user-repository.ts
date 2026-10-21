import type { User } from '@greyhoarder/domain/users';

export abstract class UserRepository {
  /** Matches the username regardless of case. */
  abstract findByUsername(username: string): Promise<User | undefined>;

  abstract findById(id: string): Promise<User | undefined>;
}
