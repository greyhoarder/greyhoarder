import { Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMinus, lucidePlus } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { boxKitName, differFromKit, type Kit, kitRowCounts, MIN_BOXES, sprueBoxName } from '@greyhoarder/domain/hoard';
import { type BoxesToAdd, parseBoxesToAdd } from '../../../models/boxes-to-add';
import { type ArmySection, type KitRow, kitSections } from '../../../models/army-sections';
import { ArmyHeading } from '../../../ui/army-heading/army-heading';
import { minisLabel } from '../../../util/kit-labels';
import { SprueRow } from '../../../ui/sprue-row/sprue-row';

/**
 * What to add of a kit: the name, the minis per box of each row it puts on the sprue, tags and how
 * many boxes. A new form starts with one box, no tags, and the name and rows as the kit describes
 * them; sprues start with every row at none and add one box. What the minis become is decided when
 * they are built.
 */
@Component({
  selector: 'app-box-form',
  imports: [NgIcon, HlmButton, HlmInput, SprueRow, ArmyHeading],
  providers: [provideIcons({ lucideMinus, lucidePlus })],
  templateUrl: './box-form.html',
  host: { class: 'flex flex-col gap-4 px-3 pb-4 sm:px-5' },
})
export class BoxForm {
  private static nextId = 0;

  readonly kit = input.required<Kit>();
  /** Sprues bought without their box. */
  readonly areSprues = input(false);
  /** The rows whose minis can be built as what was searched for. */
  readonly matchedRows = input<readonly number[]>([]);
  /** The names of the kit's factions, by id. */
  readonly factionNames = input<ReadonlyMap<string, string>>(new Map());
  /** The one army of the kit to take; the rows of the others are hidden and at none. */
  readonly onlyArmy = input<string>();
  readonly add = output<BoxesToAdd>();
  readonly wholeBoxChosen = output();

  protected readonly idPrefix = `box-form-${BoxForm.nextId++}`;

  protected readonly name = linkedSignal(() => (this.areSprues() ? sprueBoxName(this.kit()) : boxKitName(this.kit())));
  protected readonly isNameMissing = computed(() => this.name().trim() === '');
  protected readonly boxes = signal(MIN_BOXES);
  /** Typed by the user; tags have no data model of their own yet. */
  protected readonly tags = signal<readonly string[]>([]);
  protected readonly selectedTags = signal<ReadonlySet<string>>(new Set());

  private readonly allSections = computed(() => kitSections(this.kit(), this.factionNames()));
  protected readonly sections = computed(() =>
    this.allSections().filter((section) => (this.onlyArmy() ?? section.army) === section.army),
  );
  protected readonly kitCounts = computed(() => kitRowCounts(this.kit()));
  /** Minis per box of each row. */
  protected readonly rows = linkedSignal(() => {
    const shown = new Set(this.sections().flatMap((section) => section.items.map((item) => item.index)));
    return this.kitCounts().map((count, row) => (!this.areSprues() && shown.has(row) ? count : 0));
  });
  /** Sprues are always an edited box; only a box differing from its kit says so. */
  protected readonly isEdited = computed(() => !this.areSprues() && differFromKit(this.kit(), this.rows()));
  protected readonly minis = computed(() => this.rows().reduce((sum, count) => sum + count, 0) * this.boxes());
  protected readonly addLabel = computed(() => `Add ${minisLabel(this.minis())}`);
  protected readonly canAdd = computed(() => this.minis() > 0 && !this.isNameMissing());

  protected isMatched(row: number): boolean {
    return this.matchedRows().includes(row);
  }

  protected rename(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.name.set(event.target.value);
    }
  }

  protected changeRow(row: number, by: 1 | -1): void {
    this.rows.update((rows) => rows.map((count, index) => (index === row ? Math.max(0, count + by) : count)));
  }

  protected resetRows(): void {
    this.rows.set(this.kitCounts());
    this.wholeBoxChosen.emit();
  }

  protected sectionCount(section: ArmySection<KitRow>): number {
    return section.items.reduce((sum, { index }) => sum + (this.rows()[index] ?? 0), 0);
  }

  protected changeBoxes(by: number): void {
    this.boxes.update((count) => Math.max(MIN_BOXES, count + by));
  }

  protected toggleTag(tag: string): void {
    this.selectedTags.update((tags) => {
      const next = new Set(tags);
      if (!next.delete(tag)) {
        next.add(tag);
      }
      return next;
    });
  }

  /** Enter adds the typed tag and selects it. */
  protected addTag(event: Event): void {
    event.preventDefault();
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }
    const tag = event.target.value.trim();
    event.target.value = '';
    if (tag === '') {
      return;
    }
    this.tags.update((tags) => (tags.includes(tag) ? tags : [...tags, tag]));
    this.selectedTags.update((tags) => new Set([...tags, tag]));
  }

  protected submit(): void {
    this.add.emit(
      parseBoxesToAdd({
        boxes: this.boxes(),
        name: this.name(),
        rows: this.rows(),
        tags: this.tags().filter((tag) => this.selectedTags().has(tag)),
        areSprues: this.areSprues(),
      }),
    );
  }
}
