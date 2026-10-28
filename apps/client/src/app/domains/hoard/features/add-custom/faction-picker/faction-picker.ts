import { Component, effect, ElementRef, input, output, viewChild } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch, lucideX } from '@ng-icons/lucide';
import { HlmPopoverImports } from '@spartan-ng/helm/popover';
import type { FoundFaction } from '../../../../catalog/api';
import type { ChosenFaction } from '../../../application/minis/minis-addition';

/**
 * The factions of a custom mini: one chip per chosen faction with a remove button, and "+ Faction",
 * which opens a search over the catalog factions in a popover.
 */
@Component({
  selector: 'app-faction-picker',
  imports: [NgIcon, HlmPopoverImports],
  providers: [provideIcons({ lucideSearch, lucideX })],
  template: `
    <span class="text-sm font-semibold" [id]="labelId">Factions</span>
    <div class="flex flex-wrap items-center gap-2" role="group" [attr.aria-labelledby]="labelId">
      @for (faction of chosen(); track faction.id) {
        <span
          class="inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-sm"
          data-testid="add-custom-faction"
        >
          {{ faction.name }}
          <button
            type="button"
            class="text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            data-testid="add-custom-faction-remove"
            [attr.aria-label]="'Remove ' + faction.name"
            (click)="removed.emit(faction.id)"
          >
            <ng-icon name="lucideX" size="14" />
          </button>
        </span>
      }
      <!-- The search opens in a popover below the chip, so the form below stays where it is. -->
      <hlm-popover
        align="start"
        sideOffset="6"
        [state]="isOpen() ? 'open' : 'closed'"
        (stateChanged)="($event === 'open') !== isOpen() && toggled.emit()"
      >
        <button
          hlmPopoverTrigger
          type="button"
          class="inline-flex h-8 items-center rounded-full border border-dashed px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          data-testid="add-custom-add-faction"
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
              data-testid="add-custom-faction-search"
              [value]="query()"
              (input)="type($event)"
            />
          </label>
          @if (results().length > 0) {
            <ul class="flex max-h-64 flex-col overflow-y-auto" aria-label="Factions found">
              @for (faction of results(); track faction.id) {
                <li>
                  <button
                    type="button"
                    class="flex w-full items-baseline gap-1.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
                    data-testid="add-custom-faction-result"
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
    </div>
  `,
  host: { class: 'flex flex-col gap-2' },
})
export class FactionPicker {
  private static nextId = 0;

  readonly chosen = input.required<readonly ChosenFaction[]>();
  readonly isOpen = input(false);
  readonly query = input('');
  /** The factions matching the query, without the chosen ones. */
  readonly results = input<readonly FoundFaction[]>([]);
  readonly queryChange = output<string>();
  readonly added = output<FoundFaction>();
  /** The id of the faction. */
  readonly removed = output<string>();
  readonly toggled = output();

  protected readonly labelId = `faction-picker-${FactionPicker.nextId}-label`;
  protected readonly searchId = `faction-picker-${FactionPicker.nextId++}-search`;

  private readonly searchField = viewChild<ElementRef<HTMLInputElement>>('search');

  constructor() {
    // The search field takes the focus as soon as it appears.
    effect(() => this.searchField()?.nativeElement.focus());
  }

  protected type(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.queryChange.emit(event.target.value);
    }
  }
}
