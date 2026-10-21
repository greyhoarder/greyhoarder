import { NgOptimizedImage } from '@angular/common';
import { Component, input } from '@angular/core';

/** The Greyhoarder wordmark: small logo followed by the product name. */
@Component({
  selector: 'app-logo',
  imports: [NgOptimizedImage],
  template: `
    <img ngSrc="logo-small.svg" alt="" [width]="size()" [height]="size()" priority />
    <span class="font-display text-2xl font-semibold tracking-[0.08em] uppercase">Greyhoarder</span>
  `,
  host: { class: 'inline-flex items-center gap-3' },
})
export class Logo {
  /** Edge length of the logo image in pixels. */
  readonly size = input(40);
}
