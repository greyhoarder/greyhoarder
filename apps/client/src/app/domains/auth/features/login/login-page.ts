import { afterNextRender, Component, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEye, lucideEyeOff } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { Logo } from '../../../../shared/ui/logo/logo';
import { type Credentials, HttpSessionAdapter } from '../../infrastructure/http-session-adapter';
import { InvalidCredentialsError } from '../../util/invalid-credentials.error';
import { SETUP_ALREADY_DONE } from '../../util/setup-already-done';
import { ServerUnreachableError } from '../../util/server-unreachable.error';
import { TooManyLoginAttemptsError } from '../../util/too-many-login-attempts.error';

/** Sign-in screen, specified in docs/screens/login.md. */
@Component({
  selector: 'app-login-page',
  imports: [
    FormRoot,
    FormField,
    NgIcon,
    HlmButton,
    HlmCardImports,
    HlmCheckboxImports,
    HlmFieldImports,
    HlmInput,
    HlmInputGroupImports,
    Logo,
  ],
  providers: [provideIcons({ lucideEye, lucideEyeOff })],
  templateUrl: './login-page.html',
  host: { class: 'flex min-h-dvh flex-col items-center justify-center gap-8 bg-background p-4' },
})
export default class LoginPage {
  private readonly sessions = inject(HttpSessionAdapter);
  private readonly router = inject(Router);

  protected readonly credentials = signal<Credentials>({
    username: '',
    password: '',
    keepSignedIn: false,
  });

  protected readonly loginForm = form(
    this.credentials,
    (path) => {
      required(path.username, { message: 'Enter your username.' });
      required(path.password, { message: 'Enter your password.' });
    },
    {
      submission: {
        action: async () => this.signIn(),
        onInvalid: (field) => {
          this.failure.set(undefined);
          field().errorSummary()[0]?.fieldTree().focusBoundControl();
        },
      },
    },
  );

  protected readonly passwordVisible = signal(false);

  /** Set when the setup sent the user here because someone else finished it first. */
  protected readonly isSetupAlreadyDone =
    this.router.currentNavigation()?.extras.info === SETUP_ALREADY_DONE;

  /** Why the server refused the last attempt; cleared on the next one. */
  protected readonly failure = signal<string | undefined>(undefined);

  constructor() {
    afterNextRender(() => this.loginForm.username().focusBoundControl());
  }

  protected togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  private async signIn(): Promise<void> {
    this.failure.set(undefined);
    try {
      await this.sessions.signIn(this.credentials());
    } catch (error) {
      this.failure.set(failureMessage(error));
      return;
    }
    await this.router.navigateByUrl('/');
  }
}

function failureMessage(error: unknown): string {
  if (error instanceof InvalidCredentialsError) {
    return 'Username or password is incorrect.';
  }
  if (error instanceof TooManyLoginAttemptsError) {
    return 'Too many attempts. Sign-in is paused for a moment.';
  }
  if (error instanceof ServerUnreachableError) {
    return "Can't reach the server. Try again in a moment.";
  }
  throw error;
}
