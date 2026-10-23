import { Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronRight } from '@ng-icons/lucide';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { kitMeta, kitMinis } from '../../../util/kit-facts';
import type { KitOption } from '../../../util/kit-option';

/** One kit to add a box from, as a card: name, "Not checked" for drafts, meta line and minis. */
@Component({
  selector: 'app-kit-card',
  imports: [NgIcon, HlmBadge],
  providers: [provideIcons({ lucideChevronRight })],
  template: `
    <!-- Choosing a kit leads to the check step, which is not built yet. -->
    <button
      type="button"
      class="flex w-full items-center gap-4 rounded-xl border bg-card px-5 py-4 text-left transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      data-testid="add-box-kit"
    >
      <span class="flex min-w-0 flex-1 flex-col gap-0.5">
        <span class="flex min-w-0 items-center gap-2">
          <span class="truncate font-semibold">{{ kit().name }}</span>
          @if (kit().isDraft) {
            <span
              hlmBadge
              variant="outline"
              class="border-dashed border-muted-foreground/60 font-normal text-muted-foreground"
              data-testid="add-box-kit-draft"
              >Not checked</span
            >
          }
        </span>
        <span class="truncate text-sm text-muted-foreground">{{ meta() }}</span>
      </span>
      <span class="shrink-0 text-sm text-muted-foreground" data-testid="add-box-kit-minis">{{
        minis()
      }}</span>
      <ng-icon name="lucideChevronRight" size="18" class="shrink-0 text-muted-foreground" />
    </button>
  `,
})
export class KitCard {
  readonly kit = input.required<KitOption>();

  protected readonly meta = computed(() => kitMeta(this.kit()));
  protected readonly minis = computed(() => kitMinis(this.kit()));
}
