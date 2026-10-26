import { Component, computed, input, output } from '@angular/core';

/** Tells the sections apart for their labels. */
let nextId = 0;

/** A name the kit suggests and how many the box has left for it. */
export interface NameSuggestion {
  readonly name: string;
  readonly left: number;
}

/**
 * The "Build as" section: one tile per suggested name with what is left in the box, and a tile for
 * an own name (docs/screens/mini.md).
 */
@Component({
  selector: 'app-build-as',
  templateUrl: './build-as.html',
  host: { class: 'flex flex-col gap-4', role: 'group', '[attr.aria-labelledby]': 'headingId' },
})
export class BuildAs {
  readonly suggestions = input.required<readonly NameSuggestion[]>();
  /** The name the minis have or are to be built as; its tile is chosen unless an own name is typed. */
  readonly name = input.required<string>();
  readonly ownName = input.required<string>();
  /** For "Suggested by {box name}". */
  readonly boxName = input<string>();
  /** How many minis are to be built; more than are left warns. Past the sprue none. */
  readonly count = input(0);
  readonly nameChosen = output<string>();
  readonly ownNameChange = output<string>();
  /** The own name field lost focus, or Enter was pressed in it. */
  readonly ownNameCommitted = output();

  protected readonly headingId = `build-as-${nextId++}-heading`;
  protected readonly hasOwnName = computed(() => this.ownName().trim() !== '');

  protected readonly tiles = computed(() =>
    this.suggestions().map(({ name, left }) => {
      const isChosen = !this.hasOwnName() && name === this.name();
      const isTooMany = isChosen && this.count() > left;
      return {
        name,
        isChosen,
        /** None left: greyed out, not a warning; it can still be chosen. */
        isEmpty: left === 0,
        isWarning: isTooMany && left > 0,
        hint:
          left === 0
            ? 'None left in this box'
            : isTooMany
              ? `Only ${left} left in this box`
              : `${left} left in this box`,
      };
    }),
  );

  protected typeOwnName(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.ownNameChange.emit(event.target.value);
    }
  }
}
