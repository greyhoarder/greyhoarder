import { Injectable } from '@nestjs/common';
import type { UserRole } from '@greyhoarder/domain/users';
import type { UserCredentials } from '../../models/user-credentials.js';
import { UserRepository } from '../../ports/user-repository.js';

/**
 * Account operations other domains call through `users/api`; that call is the
 * entry point of this feature (ADR-0014). Everything that touches password
 * hashes goes through here, so the rules of `users` always apply.
 */
@Injectable()
export class AccountsService {
  constructor(private readonly users: UserRepository) {}

  /** The user with the password hash, for `auth` to verify a sign-in (ADR-0007). */
  findCredentials(username: string): Promise<UserCredentials | undefined> {
    return this.users.findCredentials(username);
  }

  /**
   * Creates the first account with the role `admin`. The hash is stored as
   * given; `auth` alone knows how it was made (ADR-0007).
   *
   * @throws AccountsAlreadyExistError once any account exists
   */
  createInitialAdmin(username: string, passwordHash: string): Promise<void> {
    return this.users.createInitialAdmin(username, passwordHash);
  }

  /**
   * Creates a further account; the hash is stored as given (ADR-0007).
   *
   * @throws UsernameTakenError when the name is taken
   */
  create(username: string, role: UserRole, passwordHash: string): Promise<void> {
    return this.users.create(username, role, passwordHash);
  }

  /** Notes this moment as the user's last sign-in. */
  recordLogin(id: string): Promise<void> {
    return this.users.recordLogin(id, new Date());
  }

  /** The hash is stored as given (ADR-0007). */
  changePasswordHash(id: string, passwordHash: string): Promise<void> {
    return this.users.changePasswordHash(id, passwordHash);
  }
}
