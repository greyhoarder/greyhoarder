import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HttpSessionAdapter } from '../../../infrastructure/http-session-adapter';
import { PasswordStrengthMeter } from '../../../ui/password-strength/password-strength';
import { TooManyLoginAttemptsError } from '../../../util/too-many-login-attempts.error';
import { WrongPasswordError } from '../../../util/wrong-password.error';

/** Replaces the password of the signed-in user (docs/use-cases/change-password.md). */
@Component({
  selector: 'app-change-password-page',
  imports: [HlmButton, HlmFieldImports, HlmInput, NgIcon, PasswordStrengthMeter, RouterLink],
  providers: [provideIcons({ lucideChevronLeft })],
  templateUrl: './change-password-page.html',
  host: { class: 'flex w-full max-w-md flex-col gap-5 p-4 sm:p-8 lg:p-10' },
})
export class ChangePasswordPage {
  private readonly sessions = inject(HttpSessionAdapter);
  private readonly router = inject(Router);

  protected readonly currentPassword = signal('');
  protected readonly newPassword = signal('');
  protected readonly repeatedPassword = signal('');
  protected readonly failure = signal('');
  protected readonly isChanging = signal(false);

  protected type(field: 'current' | 'new' | 'repeated', event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      const fields = { current: this.currentPassword, new: this.newPassword, repeated: this.repeatedPassword };
      fields[field].set(event.target.value);
    }
  }

  protected async change(event: Event): Promise<void> {
    event.preventDefault();
    const failure = this.invalidInput();
    this.failure.set(failure);

    if (failure !== '') {
      return;
    }

    this.isChanging.set(true);

    try {
      await this.sessions.changePassword({
        currentPassword: this.currentPassword(),
        newPassword: this.newPassword(),
      });
      await this.router.navigateByUrl('/profile', { state: { isPasswordChanged: true } });
    } catch (error) {
      this.failure.set(messageFor(error));
    } finally {
      this.isChanging.set(false);
    }
  }

  private invalidInput(): string {
    if (this.currentPassword() === '') {
      return 'Enter your current password.';
    }

    if (this.newPassword() === '') {
      return 'Enter a new password.';
    }

    return this.newPassword() === this.repeatedPassword() ? '' : 'The passwords do not match.';
  }
}

function messageFor(cause: unknown): string {
  if (cause instanceof WrongPasswordError) {
    return cause.message;
  }

  return cause instanceof TooManyLoginAttemptsError
    ? 'Too many attempts. Try again in a moment.'
    : "Can't change the password right now. Try again in a moment.";
}
