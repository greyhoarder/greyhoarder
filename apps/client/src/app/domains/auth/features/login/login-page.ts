import { afterNextRender, Component, signal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEye, lucideEyeOff } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { Logo } from '../../../../shared/ui/logo/logo';

interface Credentials {
  username: string;
  password: string;
  keepSignedIn: boolean;
}

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
        onInvalid: (field) => field().errorSummary()[0]?.fieldTree().focusBoundControl(),
      },
    },
  );

  protected readonly passwordVisible = signal(false);

  /** Shown after a valid submit until the backend is connected. */
  protected readonly notice = signal<string | null>(null);

  constructor() {
    afterNextRender(() => this.loginForm.username().focusBoundControl());
  }

  protected togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  private signIn(): void {
    this.notice.set('Signing in is not connected to the server yet.');
  }
}
