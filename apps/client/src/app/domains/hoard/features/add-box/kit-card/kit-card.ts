import { Component, computed, input, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBox, lucideCheck, lucideChevronDown, lucideSplit } from '@ng-icons/lucide';
import { provideBrnPopoverDefaultOptions } from '@spartan-ng/brain/popover';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmPopoverImports } from '@spartan-ng/helm/popover';
import { MenuKeys } from '../../../../../shared/ui/menu-keys/menu-keys';
import { armiesText, kitSections } from '../../../models/army-sections';
import { factionNamesOf, kitMeta, kitMinis } from '../../../util/kit-labels';
import { type Kit, kitRowCounts, matchingRows } from '@greyhoarder/domain/hoard';
import type { BoxesToAdd } from '../../../models/boxes-to-add';
import { BoxForm } from '../box-form/box-form';

interface ArmyChoice {
  readonly label: string;
  /** None takes the whole box. */
  readonly army?: string;
  readonly minis: number;
}

/**
 * One kit to add a box from: a header with its name, factions, release and minis, which opens
 * the form to add boxes of it below.
 */
@Component({
  selector: 'app-kit-card',
  imports: [NgIcon, HlmBadge, HlmPopoverImports, MenuKeys, BoxForm],
  providers: [
    provideIcons({ lucideBox, lucideCheck, lucideChevronDown, lucideSplit }),
    // The choice of armies is a menu, not a dialog; its list carries the role.
    provideBrnPopoverDefaultOptions({ role: undefined }),
  ],
  template: `
    <!-- The button lies behind the header, so the choice of armies in it stays a button of its own. -->
    <div class="relative">
      <button
        type="button"
        class="absolute inset-0 rounded-xl transition-colors not-aria-expanded:hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        data-testid="add-box-kit"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-controls]="formId"
        (click)="toggled.emit()"
      >
        <span class="sr-only">{{ kit().names.join(' or ') }}</span>
      </button>
      <div class="pointer-events-none relative flex w-full items-center gap-4 p-3 text-left sm:pr-5">
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
          @if (canChooseArmy()) {
            <hlm-popover align="start" sideOffset="6">
              <button
                hlmPopoverTrigger
                type="button"
                class="pointer-events-auto inline-flex w-fit items-center gap-1 rounded-sm text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                [attr.aria-haspopup]="'menu'"
                data-testid="add-box-armies"
              >
                {{ onlyArmy() ?? armies() }}
                <ng-icon name="lucideChevronDown" size="14" class="text-muted-foreground" />
              </button>
              <ul hlmPopoverContent class="w-56 gap-0 p-1" role="menu" aria-label="Armies" *hlmPopoverPortal="let menu">
                @for (choice of armyChoices(); track choice.label; let first = $first) {
                  <li role="none">
                    <button
                      type="button"
                      role="menuitemradio"
                      class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none hover:bg-accent focus-visible:bg-accent"
                      data-testid="add-box-army"
                      appMenuKeys
                      [attr.tabindex]="first ? 0 : -1"
                      [attr.aria-checked]="onlyArmy() === choice.army"
                      (click)="onlyArmy.set(choice.army); menu.close()"
                    >
                      <ng-icon
                        name="lucideCheck"
                        size="14"
                        class="text-primary"
                        [class.invisible]="onlyArmy() !== choice.army"
                      />
                      <span class="flex-1">{{ choice.label }}</span>
                      <span class="text-muted-foreground tabular-nums">{{ choice.minis }}</span>
                    </button>
                  </li>
                }
              </ul>
            </hlm-popover>
          } @else {
            <span class="truncate text-sm">{{ armies() }}</span>
          }
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
      </div>
    </div>

    @if (isOpen()) {
      <app-box-form
        [id]="formId"
        [kit]="kit()"
        [areSprues]="areSprues()"
        [matchedRows]="matchedRows()"
        [factionNames]="factionNames()"
        [onlyArmy]="onlyArmy()"
        (wholeBoxChosen)="onlyArmy.set(undefined)"
        (add)="add.emit($event)"
      />
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
  /** What the kit was searched for, to show which of its slots matched. */
  readonly search = input('');
  /** Sprues bought without their box. */
  readonly areSprues = input(false);
  readonly toggled = output();
  readonly add = output<BoxesToAdd>();

  protected readonly formId = `add-box-form-${KitCard.nextId++}`;
  protected readonly armies = computed(() => armiesText(factionNamesOf(this.kit().factionIds, this.factionNames())));
  /** Takes only one army of the kit, e.g. when the box is shared; none takes the whole box. */
  protected readonly onlyArmy = signal<string | undefined>(undefined);
  private readonly sections = computed(() => kitSections(this.kit(), this.factionNames()));
  protected readonly canChooseArmy = computed(() => this.isOpen() && !this.areSprues() && this.sections().length > 1);
  protected readonly armyChoices = computed(() => {
    const counts = kitRowCounts(this.kit());

    const armies: ArmyChoice[] = this.sections().map((section) => ({
      label: `Only ${section.army}`,
      army: section.army,
      minis: section.items.reduce((sum, { index }) => sum + (counts[index] ?? 0), 0),
    }));

    return [{ label: 'Whole box', minis: armies.reduce((sum, { minis }) => sum + minis, 0) }, ...armies];
  });
  protected readonly meta = computed(() => kitMeta(this.kit()));
  protected readonly minis = computed(() => kitMinis(this.kit()));
  protected readonly matchedRows = computed(() => matchingRows(this.kit(), this.search()));
  protected readonly owned = computed(() =>
    this.ownedBoxes() === 1 ? '1 box in your hoard' : `${this.ownedBoxes()} boxes in your hoard`,
  );
}
