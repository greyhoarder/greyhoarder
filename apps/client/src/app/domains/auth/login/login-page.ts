import { Component, signal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';

interface Credentials {
  username: string;
  password: string;
}

@Component({
  selector: 'app-login-page',
  imports: [FormRoot, FormField, HlmButton, HlmCardImports, HlmFieldImports, HlmInput],
  templateUrl: './login-page.html',
  host: { class: 'flex min-h-dvh items-center justify-center bg-muted p-4' },
})
export default class LoginPage {
  protected readonly credentials = signal<Credentials>({ username: '', password: '' });

  protected readonly loginForm = form(
    this.credentials,
    (path) => {
      required(path.username, { message: 'Enter your username.' });
      required(path.password, { message: 'Enter your password.' });
    },
    { submission: { action: async () => this.signIn() } },
  );

  /** Shown after a valid submit until the backend is connected. */
  protected readonly notice = signal<string | null>(null);

  private signIn(): void {
    this.notice.set('Signing in is not connected to the server yet.');
  }
}
