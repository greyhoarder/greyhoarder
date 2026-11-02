import { DatePipe, formatDate, LowerCasePipe } from '@angular/common';
import { Component, computed, inject, LOCALE_ID, resource, signal } from '@angular/core';
import { Router } from '@angular/router';
import { isLastActiveAdministrator, shownName, type UserRole, userRoles } from '@greyhoarder/domain/users';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown, lucideSearch, lucideTrash2, lucideX } from '@ng-icons/lucide';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { Avatar } from '../../../../shared/ui/avatar/avatar';
import { type Account, HttpAccountsAdapter } from '../../infrastructure/http-accounts-adapter';
import { avatarUrl } from '../../models/avatar-url';
import { ROLE_LABELS } from '../../models/role-labels';

const CHANGE_FAILED = "Can't change this account right now. Try again in a moment.";

/**
 * The accounts of the instance as cards that open, for administrators
 * (docs/use-cases/add-accounts.md, docs/use-cases/manage-accounts.md).
 */
@Component({
  selector: 'app-users-page',
  imports: [Avatar, DatePipe, HlmAlertDialogImports, HlmButton, HlmInput, HlmInputGroupImports, LowerCasePipe, NgIcon],
  providers: [provideIcons({ lucideChevronDown, lucideSearch, lucideTrash2, lucideX })],
  templateUrl: './users-page.html',
  host: { class: 'flex flex-col gap-3' },
})
export class UsersPage {
  private readonly accounts = inject(HttpAccountsAdapter);
  private readonly router = inject(Router);
  private readonly locale = inject(LOCALE_ID);

  protected readonly users = resource({ loader: () => this.accounts.list() });
  protected readonly list = computed<readonly Account[]>(() => (this.users.hasValue() ? this.users.value() : []));
  protected readonly query = signal('');
  /** The accounts the search leaves. */
  protected readonly visible = computed(() => {
    const query = this.query().trim().toLowerCase();

    return this.list().filter((user) => `${user.username} ${user.displayName ?? ''}`.toLowerCase().includes(query));
  });
  protected readonly roles = [...userRoles].reverse();
  protected readonly roleLabels = ROLE_LABELS;
  protected readonly shownName = shownName;
  protected readonly avatarUrl = avatarUrl;

  protected readonly openIds = signal<ReadonlySet<string>>(new Set());
  /** The new password being typed, per account. */
  protected readonly newPasswords = signal<ReadonlyMap<string, string>>(new Map());
  /** What was just done or what failed, for one account. */
  protected readonly note = signal<
    { readonly id: string; readonly text: string; readonly hasFailed: boolean } | undefined
  >(undefined);
  /** The account whose password is being reset. */
  protected readonly resettingId = signal<string | undefined>(undefined);
  protected readonly deleting = signal<Account | undefined>(undefined);
  protected readonly isDeleting = signal(false);
  protected readonly hasDeleteFailed = signal(false);

  protected isLast(account: Account): boolean {
    return isLastActiveAdministrator(account, this.list());
  }

  protected search(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.query.set(event.target.value);
    }
  }

  protected toggle({ id }: Account): void {
    this.openIds.update((ids) => {
      const opened = new Set(ids);

      if (!opened.delete(id)) {
        opened.add(id);
      }

      return opened;
    });
  }

  /** "Today, 21:03", "Yesterday, 21:03" or "30 Oct 2026, 21:03". */
  protected lastLogin(at: string): string {
    const day = (date: Date | string) => formatDate(date, 'yyyy-MM-dd', this.locale);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const time = formatDate(at, 'HH:mm', this.locale);

    if (day(at) === day(new Date())) {
      return `Today, ${time}`;
    }

    return day(at) === day(yesterday) ? `Yesterday, ${time}` : `${formatDate(at, 'd MMM y', this.locale)}, ${time}`;
  }

  protected toggleReset({ id }: Account): void {
    this.resettingId.update((resetting) => (resetting === id ? undefined : id));
  }

  protected typePassword({ id }: Account, event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      const { value } = event.target;
      this.newPasswords.update((passwords) => new Map(passwords).set(id, value));
    }
  }

  protected chooseRole(account: Account, role: UserRole): Promise<void> {
    return account.role === role ? Promise.resolve() : this.change(account, { role });
  }

  protected toggleAccess(account: Account): Promise<void> {
    return this.change(account, { disabled: !account.disabled });
  }

  protected async setPassword(account: Account): Promise<void> {
    const password = this.newPasswords().get(account.id) ?? '';

    if (password === '') {
      this.note.set({ id: account.id, text: 'Enter a password.', hasFailed: true });

      return;
    }

    try {
      await this.accounts.setPassword(account.id, password);
      this.newPasswords.update((passwords) => new Map(passwords).set(account.id, ''));
      this.resettingId.set(undefined);
      this.note.set({
        id: account.id,
        text: `The password was set. All of ${shownName(account)}'s sessions ended.`,
        hasFailed: false,
      });
      await this.confirmOwnSession();
    } catch {
      this.note.set({ id: account.id, text: CHANGE_FAILED, hasFailed: true });
    }
  }

  protected askToDelete(account: Account): void {
    this.hasDeleteFailed.set(false);
    this.deleting.set(account);
  }

  protected async delete(): Promise<void> {
    const account = this.deleting();

    if (account === undefined) {
      return;
    }

    this.isDeleting.set(true);
    this.hasDeleteFailed.set(false);

    try {
      await this.accounts.remove(account.id);
      this.users.update((users) => users?.filter(({ id }) => id !== account.id));
      this.deleting.set(undefined);
      await this.confirmOwnSession();
    } catch {
      this.hasDeleteFailed.set(true);
    } finally {
      this.isDeleting.set(false);
    }
  }

  private async change(account: Account, changes: Parameters<HttpAccountsAdapter['update']>[1]): Promise<void> {
    this.note.set(undefined);

    try {
      const updated = await this.accounts.update(account.id, changes);
      this.users.update((users) => users?.map((user) => (user.id === updated.id ? updated : user)));
      await this.confirmOwnSession();
    } catch {
      this.note.set({ id: account.id, text: CHANGE_FAILED, hasFailed: true });
    }
  }

  /** The change may have hit the signed-in administrator: the guards then lead them where they may be. */
  private async confirmOwnSession(): Promise<void> {
    await this.router.navigateByUrl(this.router.url, { onSameUrlNavigation: 'reload' });
  }
}
