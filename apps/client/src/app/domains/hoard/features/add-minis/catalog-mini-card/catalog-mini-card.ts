import { Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUser } from '@ng-icons/lucide';
import { HlmBadge } from '@spartan-ng/helm/badge';
import type { CatalogMini } from '../../../../catalog/api';

/**
 * One catalog mini to add: a header with its name, faction and the kit it comes from, which opens
 * the form projected into it below.
 */
@Component({
  selector: 'app-catalog-mini-card',
  imports: [NgIcon, HlmBadge],
  providers: [provideIcons({ lucideUser })],
  template: `
    <button
      type="button"
      class="flex w-full items-center gap-4 rounded-xl p-3 text-left transition-colors not-aria-expanded:hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:pr-5"
      data-testid="add-minis-mini"
      [attr.aria-expanded]="isOpen()"
      [attr.aria-controls]="formId()"
      (click)="toggled.emit()"
    >
      <!-- The catalog has no images; every mini shows the same placeholder. -->
      <span
        class="flex size-18 shrink-0 items-center justify-center rounded-lg bg-muted bg-busy-stripes text-muted-foreground"
        aria-hidden="true"
      >
        <ng-icon name="lucideUser" size="24" />
      </span>
      <span class="flex min-w-0 flex-1 flex-col gap-0.5">
        <span class="flex min-w-0 items-center gap-2">
          <span class="truncate font-semibold" data-testid="add-minis-mini-name">{{
            mini().name
          }}</span>
          @if (isDraft()) {
            <span
              hlmBadge
              variant="outline"
              class="shrink-0 border-dashed border-muted-foreground/60 font-normal text-muted-foreground"
              data-testid="add-minis-mini-draft"
              >Not checked</span
            >
          }
        </span>
        <span class="truncate text-sm" data-testid="add-minis-mini-faction">{{ faction() }}</span>
        <span class="truncate text-xs text-muted-foreground" data-testid="add-minis-mini-kits"
          >From {{ kit() }}</span
        >
      </span>
      @if (owned() > 0) {
        <span class="shrink-0 text-sm text-primary" data-testid="add-minis-mini-owned"
          >{{ owned() }} in your hoard</span
        >
      }
    </button>

    <!-- The page projects the form only into the open card. -->
    <ng-content />
  `,
  host: {
    class: 'block rounded-xl border bg-card transition-colors',
    '[class.border-primary]': 'isOpen()',
  },
})
export class CatalogMiniCard {
  readonly mini = input.required<CatalogMini>();
  /** "{faction} · {game system}". */
  readonly faction = input.required<string>();
  /** The kit it comes from, e.g. "Boyz · 2026". */
  readonly kit = input.required<string>();
  /** Only one card of the list is open at a time. */
  readonly isOpen = input(false);
  /** Minis of this name and faction in the hoard that are not gone. */
  readonly owned = input(0);
  /** The id of the projected form, for `aria-controls`. */
  readonly formId = input.required<string>();
  readonly toggled = output();

  /** Not checked while its kit is a draft. */
  protected readonly isDraft = computed(() => this.mini().kit.isDraft);
}
