import { Injectable } from '@nestjs/common';
import { AccountsAlreadyExistError, AccountsService, UserQueries } from '../../../users/api/index.js';
import { PasswordHasher } from '../../ports/password-hasher.js';

@Injectable()
export class SetupService {
  constructor(
    private readonly users: UserQueries,
    private readonly accounts: AccountsService,
    private readonly passwords: PasswordHasher,
  ) {}

  /** The setup is open only while no account exists (ADR-0007). */
  async isRequired(): Promise<boolean> {
    return !(await this.users.hasAny());
  }

  /**
   * Creates the first account with the role `admin`.
   *
   * @throws AccountsAlreadyExistError once any account exists
   */
  async createAdministrator(username: string, password: string): Promise<void> {
    // Checked before hashing so that calls after the setup cost no hashing time; `users` checks again atomically.
    if (!(await this.isRequired())) {
      throw new AccountsAlreadyExistError();
    }
    const passwordHash = await this.passwords.hash(password);
    await this.accounts.createInitialAdmin(username, passwordHash);
  }
}
