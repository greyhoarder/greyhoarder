import { Component, computed, input, output, signal } from '@angular/core';

/** A name offered while typing, with a muted detail such as its faction. */
export interface NameSuggestion {
  readonly name: string;
  readonly detail?: string;
}

/**
 * The name field of a custom mini: any name can be typed, and the suggestions below it, in groups,
 * fill in a name when chosen by click or by the arrow keys and Enter (combobox pattern).
 */
@Component({
  selector: 'app-name-field',
  template: `
    <label class="text-sm font-semibold" [for]="inputId">Name</label>
    <div class="relative">
      <input
        type="text"
        role="combobox"
        autocomplete="off"
        placeholder="What you built, e.g. Tankbusta Rokkiteer"
        class="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        data-testid="add-custom-name"
        [id]="inputId"
        [value]="value()"
        [attr.aria-expanded]="isListShown()"
        [attr.aria-controls]="listId"
        [attr.aria-activedescendant]="activeId()"
        [attr.aria-invalid]="isMissing()"
        [attr.aria-describedby]="isMissing() ? missingId : null"
        (input)="type($event)"
        (focus)="isOpen.set(true)"
        (blur)="isOpen.set(false)"
        (keydown.arrowDown)="move($event, 1)"
        (keydown.arrowUp)="move($event, -1)"
        (keydown.enter)="chooseActive($event)"
        (keydown.escape)="isOpen.set(false)"
      />
      @if (isListShown()) {
        <ul
          role="listbox"
          class="absolute inset-x-0 top-full z-10 mt-1 flex max-h-80 flex-col overflow-y-auto rounded-lg border bg-popover p-1 shadow-md"
          aria-label="Suggestions"
          [id]="listId"
        >
          @for (group of groups(); track group.label) {
            <li role="presentation" class="px-2 pt-2 pb-1 text-xs text-muted-foreground">
              {{ group.label }}
            </li>
            @for (suggestion of group.suggestions; track $index) {
              <li
                role="option"
                class="flex cursor-pointer items-baseline gap-2 rounded-md px-2 py-1.5 text-sm aria-selected:bg-accent"
                data-testid="add-custom-name-suggestion"
                [id]="optionId(group.offset + $index)"
                tabindex="-1"
                [attr.aria-selected]="active() === group.offset + $index"
                (mousedown)="$event.preventDefault()"
                (click)="choose(suggestion)"
                (keydown.enter)="choose(suggestion)"
              >
                {{ suggestion.name }}
                @if (suggestion.detail) {
                  <span class="text-muted-foreground">· {{ suggestion.detail }}</span>
                }
              </li>
            }
          }
        </ul>
      }
    </div>
    @if (isMissing()) {
      <p class="text-sm text-destructive" role="alert" data-testid="add-custom-name-missing" [id]="missingId">
        Give the minis a name.
      </p>
    }
  `,
  host: { class: 'flex flex-col gap-2' },
})
export class NameField {
  private static nextId = 0;

  readonly value = input.required<string>();
  /** Names of the minis in the hoard: "Your minis". */
  readonly ownNames = input<readonly NameSuggestion[]>([]);
  /** Names of catalog minis with their faction: "From the catalog". */
  readonly catalogNames = input<readonly NameSuggestion[]>([]);
  /** Adding was tried without a name. */
  readonly isMissing = input(false);
  readonly valueChange = output<string>();

  private readonly idPrefix = `name-field-${NameField.nextId++}`;
  protected readonly inputId = `${this.idPrefix}-input`;
  protected readonly listId = `${this.idPrefix}-list`;
  protected readonly missingId = `${this.idPrefix}-missing`;

  protected readonly isOpen = signal(false);
  /** The suggestion chosen by the arrow keys, by its place in all groups; -1 for none. */
  protected readonly active = signal(-1);

  /** Groups without suggestions are left out; `offset` counts the suggestions of those before. */
  protected readonly groups = computed(() => {
    const own = this.ownNames();
    return [
      { label: 'Your minis', suggestions: own, offset: 0 },
      { label: 'From the catalog', suggestions: this.catalogNames(), offset: own.length },
    ].filter((group) => group.suggestions.length > 0);
  });
  private readonly all = computed(() => [...this.ownNames(), ...this.catalogNames()]);
  protected readonly isListShown = computed(() => this.isOpen() && this.value().trim() !== '' && this.all().length > 0);
  protected readonly activeId = computed(() =>
    this.isListShown() && this.active() >= 0 ? this.optionId(this.active()) : null,
  );

  protected optionId(index: number): string {
    return `${this.idPrefix}-option-${index}`;
  }

  protected type(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.isOpen.set(true);
      this.active.set(-1);
      this.valueChange.emit(event.target.value);
    }
  }

  /** Moves through the suggestions and back to the typed text (-1), wrapping around. */
  protected move(event: Event, by: 1 | -1): void {
    event.preventDefault();
    this.isOpen.set(true);
    const last = this.all().length - 1;
    this.active.update((index) => {
      const next = index + by;
      return next > last ? -1 : next < -1 ? last : next;
    });
  }

  /** Enter fills in the suggestion chosen by the arrow keys, if any. */
  protected chooseActive(event: Event): void {
    const suggestion = this.isListShown() ? this.all()[this.active()] : undefined;
    if (suggestion !== undefined) {
      event.preventDefault();
      this.choose(suggestion);
    }
  }

  protected choose(suggestion: NameSuggestion): void {
    this.valueChange.emit(suggestion.name);
    this.isOpen.set(false);
    this.active.set(-1);
  }
}
