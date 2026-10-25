import { Component, computed, input } from '@angular/core';
import { eitherOrParts } from '../../util/either-or';

/** The name of a box or mini; for either-or kits its outcomes apart by a muted "or". */
@Component({
  selector: 'app-either-or-name',
  template: `
    @for (part of parts(); track $index) {
      @if (!$first) {
        <span class="font-normal text-muted-foreground" data-separator> or </span>
      }
      {{ part }}
    }
  `,
})
export class EitherOrName {
  readonly name = input.required<string>();

  protected readonly parts = computed(() => eitherOrParts(this.name()));
}
