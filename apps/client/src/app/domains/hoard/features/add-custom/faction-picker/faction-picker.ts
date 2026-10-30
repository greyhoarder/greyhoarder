import { Component, computed, input, output } from '@angular/core';
import type { OwnFaction } from '@greyhoarder/domain/hoard';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';
import type { FoundFaction } from '../../../../catalog/api';
import { type FactionDraft, idsOf } from '../../../models/faction-draft';
import { AddFaction } from '../../../ui/add-faction/add-faction';

/**
 * The factions of a custom mini: one chip per chosen faction with a remove button, and "+ Faction",
 * which opens a search over the user's own and the catalog factions in a popover.
 */
@Component({
  selector: 'app-faction-picker',
  imports: [NgIcon, AddFaction],
  providers: [provideIcons({ lucideX })],
  template: `
    <span class="text-sm font-semibold" [id]="labelId">Factions</span>
    <div class="flex flex-wrap items-center gap-2" role="group" [attr.aria-labelledby]="labelId">
      @for (faction of chosen(); track $index) {
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
            (click)="removed.emit($index)"
          >
            <ng-icon name="lucideX" size="14" />
          </button>
        </span>
      }
      <app-add-faction
        testId="add-custom"
        [chosenIds]="chosenIds()"
        [isOpen]="isOpen()"
        [query]="query()"
        [results]="results()"
        [ownResults]="ownResults()"
        (queryChange)="queryChange.emit($event)"
        (added)="added.emit($event)"
        (created)="created.emit($event)"
        (toggled)="toggled.emit()"
      />
    </div>
  `,
  host: { class: 'flex flex-col gap-2' },
})
export class FactionPicker {
  private static nextId = 0;

  readonly chosen = input.required<readonly FactionDraft[]>();
  readonly isOpen = input(false);
  readonly query = input('');
  /** The factions matching the query; the chosen ones are not offered again. */
  readonly results = input<readonly FoundFaction[]>([]);
  /** The user's own factions matching the query. */
  readonly ownResults = input<readonly OwnFaction[]>([]);
  readonly queryChange = output<string>();
  readonly added = output<OwnFaction | FoundFaction>();
  /** The typed name of a new own faction. */
  readonly created = output<string>();
  /** The position of the faction among the chosen. */
  readonly removed = output<number>();
  readonly toggled = output();

  protected readonly labelId = `faction-picker-${FactionPicker.nextId++}-label`;
  protected readonly chosenIds = computed(() => idsOf(this.chosen()));
}
