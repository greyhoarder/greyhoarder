import { Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBox, lucideSplit } from '@ng-icons/lucide';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { factionNamesOf, kitMeta, kitMinis } from '../../../util/kit-labels';
import type { Kit } from '@greyhoarder/domain/hoard';
import type { BoxesToAdd } from '../../../models/boxes-to-add';
import { BoxForm } from '../box-form/box-form';

/**
 * One kit to add a box from: a header with its name, factions, release and minis, which opens
 * the form to add boxes of it below.
 */
@Component({
  selector: 'app-kit-card',
  imports: [NgIcon, HlmBadge, BoxForm],
  providers: [provideIcons({ lucideBox, lucideSplit })],
  template: `
    <button
      type="button"
      class="flex w-full items-center gap-4 rounded-xl p-3 text-left transition-colors not-aria-expanded:hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:pr-5"
      data-testid="add-box-kit"
      [attr.aria-expanded]="isOpen()"
      [attr.aria-controls]="formId"
      (click)="toggled.emit()"
    >
      <!-- The catalog has no images; every kit shows the same placeholder. -->
      <span
        class="flex size-18 shrink-0 items-center justify-center rounded-lg bg-muted bg-busy-stripes text-muted-foreground"
        aria-hidden="true"
      >
        <ng-icon name="lucideBox" size="24" />
      </span>
      <span class="flex min-w-0 flex-1 flex-col gap-0.5">
        <span class="flex min-w-0 items-center gap-2">
          <!-- Editions of a kit share its name; the year tells them apart. -->
          <span class="truncate font-semibold" data-testid="add-box-kit-name">
            @for (name of kit().names; track name) {
              @if (!$first) {
                <span class="font-normal text-muted-foreground">or</span>
              }
              {{ name }}
            }
            @if (kit().year) {
              <span class="font-normal text-muted-foreground" data-testid="add-box-kit-year">· {{ kit().year }}</span>
            }
          </span>
          @if (kit().isDraft) {
            <span
              hlmBadge
              variant="outline"
              class="shrink-0 border-dashed border-muted-foreground/60 font-normal text-muted-foreground"
              data-testid="add-box-kit-draft"
              >Not checked</span
            >
          }
        </span>
        <span class="truncate text-sm">{{ armies() }}</span>
        <span class="truncate text-xs text-muted-foreground">{{ meta() }}</span>
        <!-- On narrow screens the owned boxes move below, so the name keeps its room. -->
        @if (ownedBoxes() > 0) {
          <span class="truncate text-sm text-primary sm:hidden">{{ owned() }}</span>
        }
      </span>
      <span class="flex shrink-0 flex-col items-end gap-0.5 text-sm">
        <span data-testid="add-box-kit-minis">{{ minis() }}</span>
        @if (kit().variants.length > 1) {
          <span class="flex items-center gap-1 text-xs text-muted-foreground" data-testid="add-box-kit-builds">
            <ng-icon name="lucideSplit" size="14" aria-hidden="true" />
            {{ kit().variants.length }} builds
          </span>
        }
        @if (ownedBoxes() > 0) {
          <span class="hidden text-primary sm:inline" data-testid="add-box-kit-owned">{{ owned() }}</span>
        }
      </span>
    </button>

    @if (isOpen()) {
      <app-box-form [id]="formId" [kit]="kit()" (add)="add.emit($event)" />
    }
  `,
  host: {
    class: 'block rounded-xl border bg-card transition-colors',
    '[class.border-primary]': 'isOpen()',
  },
})
export class KitCard {
  private static nextId = 0;

  readonly kit = input.required<Kit>();
  /** The names of the kit's factions, by id. */
  readonly factionNames = input.required<ReadonlyMap<string, string>>();
  /** Only one card of the list is open at a time. */
  readonly isOpen = input(false);
  /** Boxes of this kit already in the hoard. */
  readonly ownedBoxes = input(0);
  readonly toggled = output();
  readonly add = output<BoxesToAdd>();

  protected readonly formId = `add-box-form-${KitCard.nextId++}`;
  protected readonly armies = computed(() => factionNamesOf(this.kit().factionIds, this.factionNames()).join(' · '));
  protected readonly meta = computed(() => kitMeta(this.kit()));
  protected readonly minis = computed(() => kitMinis(this.kit()));
  protected readonly owned = computed(() =>
    this.ownedBoxes() === 1 ? '1 box in your hoard' : `${this.ownedBoxes()} boxes in your hoard`,
  );
}
