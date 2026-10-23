import { Component, computed, input, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCirclePlus, lucideSearch } from '@ng-icons/lucide';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import { HlmPopoverImports } from '@spartan-ng/helm/popover';

const MAX_NAMED = 2;

export interface FilterOption {
  readonly value: string;
  readonly label: string;
  /** How many minis have this value, shown next to it. */
  readonly count: number;
}

/** A filter chip that opens a searchable list of values to tick, e.g. the factions of the hoard. */
@Component({
  selector: 'app-filter-chip',
  imports: [NgIcon, HlmBadge, HlmButton, HlmCheckbox, HlmPopoverImports],
  providers: [provideIcons({ lucideCirclePlus, lucideSearch })],
  templateUrl: './filter-chip.html',
})
export class FilterChip {
  private static nextId = 0;

  /** Ties each checkbox to its label; unique per chip, since the lists open in a portal. */
  protected readonly idPrefix = `filter-chip-${FilterChip.nextId++}`;

  readonly label = input.required<string>();
  /** Test IDs are `<prefix>-<label>`; lists of minis and of boxes each have their own. */
  readonly testIdPrefix = input('hoard-filter');
  readonly options = input.required<readonly FilterOption[]>();
  readonly selected = input<ReadonlySet<string>>(new Set());
  readonly selectedChange = output<ReadonlySet<string>>();

  protected readonly query = signal('');

  protected readonly visibleOptions = computed(() => {
    const needle = this.query().trim().toLowerCase();
    return this.options().filter((option) => option.label.toLowerCase().includes(needle));
  });

  /** Up to two selected values are named on the chip; more are counted. */
  protected readonly summary = computed<readonly string[]>(() => {
    const selected = this.selected();
    if (selected.size > MAX_NAMED) {
      return [`${selected.size} selected`];
    }
    return [...selected].map(
      (value) => this.options().find((option) => option.value === value)?.label ?? value,
    );
  });

  protected toggle(value: string): void {
    const next = new Set(this.selected());
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    this.selectedChange.emit(next);
  }

  protected clear(): void {
    this.selectedChange.emit(new Set());
  }

  protected search(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.query.set(event.target.value);
    }
  }
}
