import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_PATTERN,
  type UserRole,
  userRoles,
} from '@greyhoarder/domain/users';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HttpAccountsAdapter } from '../../infrastructure/http-accounts-adapter';
import { ROLE_LABELS } from '../../models/role-labels';
import { PasswordStrengthMeter } from '../../ui/password-strength/password-strength';
import { UsernameTakenError } from '../../util/username-taken.error';

/** A new account: username, role and first password (docs/use-cases/add-accounts.md). */
@Component({
  selector: 'app-add-user-page',
  imports: [HlmButton, HlmFieldImports, HlmInput, NgIcon, PasswordStrengthMeter, RouterLink],
  providers: [provideIcons({ lucideChevronLeft })],
  templateUrl: './add-user-page.html',
  host: { class: 'flex max-w-sm flex-col gap-5' },
})
export class AddUserPage {
  private readonly accounts = inject(HttpAccountsAdapter);
  private readonly router = inject(Router);

  protected readonly roles = [...userRoles].reverse();
  protected readonly roleLabels = ROLE_LABELS;
  protected readonly username = signal('');
  protected readonly role = signal<UserRole>('member');
  protected readonly password = signal('');
  protected readonly failure = signal('');
  protected readonly isAdding = signal(false);

  protected typeUsername(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.username.set(event.target.value);
    }
  }

  protected typePassword(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.password.set(event.target.value);
    }
  }

  protected async add(event: Event): Promise<void> {
    event.preventDefault();
    const username = this.username().trim();
    const failure = invalidInput(username, this.password());
    this.failure.set(failure);

    if (failure !== '') {
      return;
    }

    this.isAdding.set(true);

    try {
      await this.accounts.add({ username, role: this.role(), password: this.password() });
      await this.router.navigateByUrl('/settings/users');
    } catch (error) {
      this.failure.set(
        error instanceof UsernameTakenError ? error.message : "Can't add the user right now. Try again in a moment.",
      );
    } finally {
      this.isAdding.set(false);
    }
  }
}

function invalidInput(username: string, password: string): string {
  if (username === '') {
    return 'Enter a username.';
  }

  if (username.length < USERNAME_MIN_LENGTH || username.length > USERNAME_MAX_LENGTH) {
    return `Use ${USERNAME_MIN_LENGTH} to ${USERNAME_MAX_LENGTH} characters.`;
  }

  if (!USERNAME_PATTERN.test(username)) {
    return 'Use only letters, digits, dots, underscores and hyphens.';
  }

  return password === '' ? 'Enter a password.' : '';
}
