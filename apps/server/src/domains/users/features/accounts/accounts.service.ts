import { Injectable } from '@nestjs/common';
import type { UserCredentials } from '../../ports/user-credentials.js';
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
}
