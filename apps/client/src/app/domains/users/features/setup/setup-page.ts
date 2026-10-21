import { afterNextRender, Component, signal } from '@angular/core';
import { form, FormField, FormRoot, required, validate } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEye, lucideEyeOff } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { Logo } from '../../../../shared/ui/logo/logo';

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
  ],
  providers: [provideIcons({ lucideEye, lucideEyeOff })],
  templateUrl: './setup-page.html',
  host: { class: 'flex min-h-dvh flex-col items-center justify-center gap-8 bg-background p-4' },
})
export class SetupPage {
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
        onInvalid: (field) => field().errorSummary()[0]?.fieldTree().focusBoundControl(),
      },
    },
  );

  protected readonly passwordVisible = signal(false);
  protected readonly passwordConfirmationVisible = signal(false);

  /** Shown after a valid submit until the backend is connected. */
  protected readonly notice = signal<string | undefined>(undefined);

  constructor() {
    afterNextRender(() => this.setupForm.username().focusBoundControl());
  }

  protected togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  protected togglePasswordConfirmationVisibility(): void {
    this.passwordConfirmationVisible.update((visible) => !visible);
  }

  private createAdministrator(): void {
    this.notice.set('Setting up is not connected to the server yet.');
  }
}
