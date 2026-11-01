import { Injectable } from '@nestjs/common';
import { isLastActiveAdministrator, type User, type UserRole } from '@greyhoarder/domain/users';
import { DomainEvents } from '../../../../shared/events/domain-events.js';
import { UserDeleting } from '../../../../shared/events/user-deleting.event.js';
import { AvatarFiles } from '../../ports/avatar-files.js';
import { UserQueries } from '../../ports/user-queries.js';
import { UserRepository } from '../../ports/user-repository.js';
import { LastAdministratorError } from './errors/last-administrator.error.js';
import { UnknownAccountError } from './errors/unknown-account.error.js';

/** Roles, disabling and deleting accounts, for administrators (docs/use-cases/manage-accounts.md). */
@Injectable()
export class UserManagementService {
  constructor(
    private readonly users: UserRepository,
    private readonly queries: UserQueries,
    private readonly files: AvatarFiles,
    private readonly events: DomainEvents,
  ) {}

  /**
   * @throws UnknownAccountError when there is no such account
   * @throws LastAdministratorError when no active administrator would remain
   */
  async change(id: string, changes: { readonly role?: UserRole; readonly disabled?: boolean }): Promise<User> {
    const isDemoted = changes.role === 'member' || changes.disabled === true;
    await this.accountOf(id, isDemoted);
    return this.users.updateAccount(id, changes);
  }

  /**
   * Makes the account inactive, lets the others remove what they keep for it, then deletes it.
   * When they fail, the account stays as it was.
   *
   * @throws UnknownAccountError when there is no such account
   * @throws LastAdministratorError when no active administrator would remain
   */
  async remove(id: string): Promise<void> {
    const account = await this.accountOf(id, true);
    await this.users.updateAccount(id, { disabled: true });
    try {
      await this.events.dispatch(new UserDeleting(id));
    } catch (error) {
      await this.users.updateAccount(id, { disabled: account.disabled });
      throw error;
    }
    await this.users.remove(id);
    if (account.avatarId !== undefined) {
      await this.files.remove(account.avatarId);
    }
  }

  private async accountOf(id: string, isDemoted: boolean): Promise<User> {
    const accounts = await this.queries.findAll();
    const account = accounts.find((each) => each.id === id);
    if (account === undefined) {
      throw new UnknownAccountError();
    }
    if (isDemoted && isLastActiveAdministrator(account, accounts)) {
      throw new LastAdministratorError();
    }
    return account;
  }
}
