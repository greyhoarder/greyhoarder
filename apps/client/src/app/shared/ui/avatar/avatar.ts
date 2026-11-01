import { Component, computed, input } from '@angular/core';

/** A round picture of a person, or the first letter of their name without one. Decorative: the name stands beside it. */
@Component({
  selector: 'app-avatar',
  template: `
    @if (url(); as source) {
      <img class="size-full rounded-full object-cover" alt="" [src]="source" />
    } @else {
      {{ letter() }}
    }
  `,
  host: {
    'aria-hidden': 'true',
    class: 'flex size-10 shrink-0 items-center justify-center rounded-full bg-muted font-semibold uppercase',
  },
})
export class Avatar {
  readonly name = input.required<string>();
  readonly url = input<string>();

  protected readonly letter = computed(() => this.name().charAt(0));
}
