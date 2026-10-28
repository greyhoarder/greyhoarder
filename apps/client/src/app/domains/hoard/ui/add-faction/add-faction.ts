import { Component, computed, effect, ElementRef, input, output, viewChild } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch } from '@ng-icons/lucide';
import { HlmPopoverImports } from '@spartan-ng/helm/popover';
import type { FoundFaction } from '../../../catalog/api';

/** Tells the searches apart for `aria-controls`. */
let nextId = 0;

/** "+ Faction": a dashed chip that opens a search over the catalog factions in a popover. */
@Component({
  selector: 'app-add-faction',
  imports: [NgIcon, HlmPopoverImports],
  providers: [provideIcons({ lucideSearch })],
  template: `
    <!-- The search opens in a popover below the chip, so the form below stays where it is. -->
    <hlm-popover
      align="start"
      sideOffset="6"
      [state]="isOpen() ? 'open' : 'closed'"
      (stateChanged)="followState($event)"
    >
      <button
        hlmPopoverTrigger
        type="button"
        class="inline-flex h-8 items-center rounded-full border border-dashed px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        [attr.data-testid]="testId() + '-add-faction'"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-controls]="searchId"
      >
        + Faction
      </button>
      <div hlmPopoverContent class="w-80 gap-2 p-2" [id]="searchId" *hlmPopoverPortal>
        <label
          class="flex h-9 w-full items-center gap-2 rounded-md border border-input px-2.5 focus-within:ring-2 focus-within:ring-ring"
        >
          <ng-icon name="lucideSearch" size="16" class="text-muted-foreground" />
          <input
            #search
            type="search"
            class="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Search factions"
            aria-label="Search factions"
            [attr.data-testid]="testId() + '-faction-search'"
            [value]="query()"
            (input)="type($event)"
          />
        </label>
        @if (offered().length > 0) {
          <ul class="flex max-h-64 flex-col overflow-y-auto" aria-label="Factions found">
            @for (faction of offered(); track faction.id) {
              <li>
                <button
                  type="button"
                  class="flex w-full items-baseline gap-1.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
                  [attr.data-testid]="testId() + '-faction-result'"
                  (click)="added.emit(faction)"
                >
                  {{ faction.name }}
                  <span class="text-muted-foreground">· {{ faction.systemName }}</span>
                </button>
              </li>
            }
          </ul>
        } @else {
          <p class="px-2 py-1.5 text-sm text-muted-foreground">
            {{ query().trim() === '' ? 'Type a faction name.' : 'No factions match.' }}
          </p>
        }
      </div>
    </hlm-popover>
  `,
})
export class AddFaction {
  /** Its chip, search and results are `{testId}-add-faction`, `-faction-search` and `-faction-result`. */
  readonly testId = input.required<string>();
  /** Not offered again. */
  readonly chosenIds = input<readonly string[]>([]);
  readonly isOpen = input(false);
  readonly query = input('');
  /** The factions matching the query. */
  readonly results = input<readonly FoundFaction[]>([]);
  readonly queryChange = output<string>();
  readonly added = output<FoundFaction>();
  readonly toggled = output();

  protected readonly searchId = `add-faction-${nextId++}-search`;
  protected readonly offered = computed(() =>
    this.results().filter((faction) => !this.chosenIds().includes(faction.id)),
  );

  private readonly searchField = viewChild<ElementRef<HTMLInputElement>>('search');

  constructor() {
    // The search field takes the focus as soon as it appears.
    effect(() => this.searchField()?.nativeElement.focus());
  }

  /**
   * The popover opens and closes itself on clicks and Escape; the page holds whether it is open, so
   * a change it did not ask for is passed on as a toggle.
   */
  protected followState(state: 'open' | 'closed'): void {
    if ((state === 'open') !== this.isOpen()) {
      this.toggled.emit();
    }
  }

  protected type(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.queryChange.emit(event.target.value);
    }
  }
}
