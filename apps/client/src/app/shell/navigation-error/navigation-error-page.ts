import { Component, computed, inject } from '@angular/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { Logo } from '../../shared/ui/logo/logo';
import { NavigationFailure } from '../navigation-failure';

/** Shown in place of a page whose navigation failed. Specified in docs/screens/navigation-error.md. */
@Component({
  selector: 'app-navigation-error',
  imports: [HlmButton, Logo],
  template: `
    <app-logo [size]="52" />

    <main class="flex w-full max-w-sm flex-col items-center gap-6 text-center">
      <p role="alert" data-testid="navigation-error-message">{{ message() }}</p>
      <button
        hlmBtn
        type="button"
        class="h-10 text-sm font-semibold"
        data-testid="navigation-error-retry"
        [disabled]="failure.isRetrying()"
        [attr.aria-busy]="failure.isRetrying()"
        (click)="failure.retry()"
      >
        {{ failure.isRetrying() ? 'Trying again…' : 'Try again' }}
      </button>
    </main>
  `,
  host: { class: 'flex min-h-dvh flex-col items-center justify-center gap-8 bg-background p-4' },
})
export class NavigationErrorPage {
  protected readonly failure = inject(NavigationFailure);

  protected readonly message = computed(() =>
    this.failure.reason() === 'unreachable'
      ? "Can't reach the server. Try again in a moment."
      : 'Something went wrong. Try again in a moment.',
  );
}
