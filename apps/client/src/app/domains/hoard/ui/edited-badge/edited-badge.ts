import { Component } from '@angular/core';
import { HlmBadge } from '@spartan-ng/helm/badge';

/** Marks a box whose minis on the sprue the user counted themselves (docs/screens/hoard.md, Behavior). */
@Component({
  selector: 'app-edited-badge',
  imports: [HlmBadge],
  template: `
    <span
      hlmBadge
      variant="outline"
      class="rounded-md font-normal text-muted-foreground"
      title="Counted by you, not as the kit describes"
    >
      Edited
    </span>
  `,
  host: { class: 'inline-flex shrink-0' },
})
export class EditedBadge {}
