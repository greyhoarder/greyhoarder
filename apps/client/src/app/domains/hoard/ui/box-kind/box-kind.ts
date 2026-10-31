import { Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBox, lucideBlocks } from '@ng-icons/lucide';

/** What a box is, as an icon before its kit line: a box, or sprues bought without their box. */
@Component({
  selector: 'app-box-kind',
  imports: [NgIcon],
  providers: [provideIcons({ lucideBox, lucideBlocks })],
  template: `
    <ng-icon
      class="shrink-0 text-muted-foreground [&_svg]:block"
      size="14"
      role="img"
      data-testid="box-kind"
      [name]="areSprues() ? 'lucideBlocks' : 'lucideBox'"
      [attr.data-kind]="areSprues() ? 'sprues' : 'box'"
      [attr.aria-label]="areSprues() ? 'Sprues' : 'Box'"
    />
  `,
  host: { class: 'inline-flex shrink-0 items-center' },
})
export class BoxKind {
  readonly areSprues = input(false);
}
