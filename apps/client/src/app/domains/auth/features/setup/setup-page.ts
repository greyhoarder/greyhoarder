import { afterNextRender, Component, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, required, type TreeValidationResult, validate } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEye, lucideEyeOff } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { Logo } from '../../../../shared/ui/logo/logo';
import { HttpSessionAdapter } from '../../infrastructure/http-session-adapter';
import { HttpSetupAdapter } from '../../infrastructure/http-setup-adapter';
import { PasswordStrengthMeter } from '../../ui/password-strength/password-strength';
import { AccountsAlreadyExistError } from '../../util/accounts-already-exist.error';
import { InvalidAdministratorError } from '../../util/invalid-administrator.error';
import { ServerUnreachableError } from '../../../../shared/http/server-unreachable.error';
import { SETUP_ALREADY_DONE } from '../../util/setup-already-done';
import { SetupStatus } from './setup-status';

interface InitialAdministrator {
  username: string;
  password: string;
  passwordConfirmation: string;
}

/** Creates the first administrator; specified in docs/screens/setup.md. */
@Component({
  selector: 'app-setup-page',
  imports: [
    FormRoot,
    FormField,
    NgIcon,
    HlmButton,
    HlmCardImports,
    HlmFieldImports,
    HlmInput,
    HlmInputGroupImports,
    Logo,
    PasswordStrengthMeter,
  ],
  providers: [provideIcons({ lucideEye, lucideEyeOff })],
  templateUrl: './setup-page.html',
  host: { class: 'flex min-h-dvh flex-col items-center justify-center gap-8 bg-background p-4' },
})
export class SetupPage {
  private readonly setup = inject(HttpSetupAdapter);
  private readonly setupStatus = inject(SetupStatus);
  private readonly sessions = inject(HttpSessionAdapter);
  private readonly router = inject(Router);

  protected readonly administrator = signal<InitialAdministrator>({
    username: '',
    password: '',
    passwordConfirmation: '',
  });

  protected readonly setupForm = form(
    this.administrator,
    (path) => {
      required(path.username, { message: 'Enter a username.' });
      required(path.password, { message: 'Enter a password.' });
      required(path.passwordConfirmation, { message: 'Repeat the password.' });
      validate(path.passwordConfirmation, ({ value, valueOf }) =>
        value() && value() !== valueOf(path.password)
          ? { kind: 'passwordMismatch', message: 'The passwords do not match.' }
          : undefined,
      );
    },
    {
      submission: {
        action: async () => this.createAdministrator(),
        onInvalid: (field) => {
          this.failure.set(undefined);
          field().errorSummary()[0]?.fieldTree().focusBoundControl();
        },
      },
    },
  );

  protected readonly passwordVisible = signal(false);
  protected readonly passwordConfirmationVisible = signal(false);

  /** Why the last attempt failed, when it concerns no single field; cleared on the next one. */
  protected readonly failure = signal<string | undefined>(undefined);

  constructor() {
    afterNextRender(() => this.setupForm.username().focusBoundControl());
  }

  protected togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  protected togglePasswordConfirmationVisibility(): void {
    this.passwordConfirmationVisible.update((visible) => !visible);
  }

  private async createAdministrator(): Promise<TreeValidationResult> {
    this.failure.set(undefined);
    const { username, password } = this.administrator();
    try {
      await this.setup.createAdministrator(username, password);
    } catch (error) {
      return this.handleRejection(error);
    }
    this.setupStatus.markDone();
    await this.signInAs(username, password);
    return undefined;
  }

  private async handleRejection(error: unknown): Promise<TreeValidationResult> {
    if (error instanceof InvalidAdministratorError) {
      const { username, password } = error.messages;
      return [
        ...(username ? [{ kind: 'server', message: username, fieldTree: this.setupForm.username }] : []),
        ...(password ? [{ kind: 'server', message: password, fieldTree: this.setupForm.password }] : []),
      ];
    }
    if (error instanceof AccountsAlreadyExistError) {
      this.setupStatus.markDone();
      await this.router.navigateByUrl('/login', { info: SETUP_ALREADY_DONE });
      return undefined;
    }
    if (error instanceof ServerUnreachableError) {
      this.failure.set("Can't reach the server. Try again in a moment.");
      return undefined;
    }
    throw error;
  }

  /** The account exists at this point; if signing in fails anyway, the login takes over. */
  private async signInAs(username: string, password: string): Promise<void> {
    try {
      await this.sessions.signIn({ username, password, keepSignedIn: false });
    } catch {
      await this.router.navigateByUrl('/login');
      return;
    }
    await this.router.navigateByUrl('/');
  }
}
