import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCircleCheck, lucideX } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';

/** What was just added or changed, maybe with a link to where it is now listed, and a button to hide it. */
@Component({
  selector: 'app-added-bar',
  imports: [RouterLink, NgIcon, HlmButton],
  providers: [provideIcons({ lucideCircleCheck, lucideX })],
  template: `
    <div
      class="flex items-center gap-3 rounded-xl border border-primary/60 bg-primary/10 px-4 py-2.5 text-sm"
      [attr.data-testid]="testId()"
    >
      <ng-icon name="lucideCircleCheck" size="18" class="shrink-0 text-primary" />
      <span class="flex-1">{{ message() }}</span>
      @if (link(); as link) {
        <a
          class="font-semibold underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          [routerLink]="link"
          [attr.data-testid]="testId() + '-show'"
          >{{ linkLabel() }}</a
        >
      }
      <button
        hlmBtn
        variant="ghost"
        size="icon"
        type="button"
        aria-label="Dismiss"
        [attr.data-testid]="testId() + '-dismiss'"
        (click)="dismissed.emit()"
      >
        <ng-icon name="lucideX" size="16" />
      </button>
    </div>
  `,
})
export class AddedBar {
  readonly message = input.required<string>();
  /** Left out for a bar without a link. */
  readonly link = input<string>();
  readonly linkLabel = input('');
  /** Its link and button are `{testId}-show` and `{testId}-dismiss`. */
  readonly testId = input.required<string>();
  readonly dismissed = output();
}
