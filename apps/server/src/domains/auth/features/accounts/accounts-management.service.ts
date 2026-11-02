import { Injectable } from '@nestjs/common';
import type { User, UserRole } from '@greyhoarder/domain/users';
import { AccountsService, UnknownAccountError, UserQueries } from '../../../users/api/index.js';
import { PasswordHasher } from '../../ports/password-hasher.js';
import { SessionRegistry } from '../../ports/session-registry.js';

/** The accounts of the instance, for administrators (docs/use-cases/add-accounts.md). */
@Injectable()
export class AccountsManagementService {
  constructor(
    private readonly users: UserQueries,
    private readonly accounts: AccountsService,
    private readonly passwords: PasswordHasher,
    private readonly sessions: SessionRegistry,
  ) {}

  list(): Promise<User[]> {
    return this.users.findAll();
  }

  /** @throws UsernameTakenError when the name is taken */
  async add(username: string, role: UserRole, password: string): Promise<void> {
    await this.accounts.create(username, role, await this.passwords.hash(password));
  }

  /**
   * Replaces a forgotten password and ends all of the account's sessions (ADR-0007).
   *
   * @throws UnknownAccountError when there is no such account
   */
  async setPassword(id: string, password: string): Promise<void> {
    if ((await this.users.findById(id)) === undefined) {
      throw new UnknownAccountError();
    }

    await this.accounts.changePasswordHash(id, await this.passwords.hash(password));
    await this.sessions.removeAll(id);
  }
}
