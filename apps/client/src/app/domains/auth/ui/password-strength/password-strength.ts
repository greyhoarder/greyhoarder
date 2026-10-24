import { Component, computed, input, resource } from '@angular/core';
import type { PasswordStrength } from '../../models/password-strength';
import { loadPasswordStrengthRater } from '../../util/password-strength-rater';

interface StrengthLevel {
  readonly value: number;
  readonly label: string;
  /** Fill of the active segments; theme tokens only (docs/design-system.md). */
  readonly fill: string;
  readonly text: string;
}

const LEVELS: Readonly<Record<PasswordStrength, StrengthLevel>> = {
  'too-weak': { value: 1, label: 'Too weak', fill: 'bg-destructive', text: 'text-destructive' },
  weak: { value: 2, label: 'Weak', fill: 'bg-muted-foreground', text: 'text-muted-foreground' },
  fair: { value: 3, label: 'Fair', fill: 'bg-muted-foreground', text: 'text-muted-foreground' },
  strong: { value: 4, label: 'Strong', fill: 'bg-primary', text: 'text-foreground' },
};

const SEGMENTS = [1, 2, 3, 4] as const;

/**
 * Four-segment strength meter for a password, as wide as its field, with the
 * level named above it. Always visible, so typing never moves the layout;
 * without a password the segments are empty and no level is shown.
 */
@Component({
  selector: 'app-password-strength',
  template: `
    <div
      class="flex flex-col gap-1"
      [attr.role]="level() ? 'meter' : null"
      [attr.aria-label]="level() ? 'Password strength' : null"
      [attr.aria-valuemin]="level() ? 1 : null"
      [attr.aria-valuemax]="level() ? 4 : null"
      [attr.aria-valuenow]="level()?.value"
      [attr.aria-valuetext]="level()?.label"
      [attr.aria-hidden]="level() ? null : true"
    >
      <div class="flex h-4 items-center justify-between text-xs">
        <span class="text-muted-foreground">Password strength</span>
        <span [class]="level()?.text">{{ level()?.label }}</span>
      </div>
      <div class="grid grid-cols-4 gap-1">
        @for (segment of segments; track segment) {
          <span
            class="h-1 rounded-full"
            [class]="segment <= (level()?.value ?? 0) ? level()?.fill : 'bg-muted'"
          ></span>
        }
      </div>
    </div>
  `,
})
export class PasswordStrengthMeter {
  readonly password = input.required<string>();

  /** Words that are easy to guess in this context, e.g. the username. */
  readonly userInputs = input<readonly string[]>([]);

  protected readonly segments = SEGMENTS;

  /** Loads the dictionaries once, when the meter appears. */
  private readonly rater = resource({ loader: () => loadPasswordStrengthRater() });

  protected readonly level = computed((): StrengthLevel | undefined => {
    const rate = this.rater.value();
    const password = this.password();
    return rate && password ? LEVELS[rate(password, this.userInputs())] : undefined;
  });
}
