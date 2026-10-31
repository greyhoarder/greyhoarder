import { Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMinus, lucidePlus } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import {
  boxKitName,
  differFromKit,
  type Kit,
  kitRowCounts,
  MIN_BOXES,
  sprueBoxName,
  sprueMinis,
} from '@greyhoarder/domain/hoard';
import { type BoxesToAdd, parseBoxesToAdd } from '../../../models/boxes-to-add';
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
  imports: [NgIcon, HlmButton, HlmInput, SprueRow],
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
  readonly add = output<BoxesToAdd>();

  protected readonly idPrefix = `box-form-${BoxForm.nextId++}`;

  protected readonly name = linkedSignal(() => (this.areSprues() ? sprueBoxName(this.kit()) : boxKitName(this.kit())));
  protected readonly isNameMissing = computed(() => this.name().trim() === '');
  protected readonly boxes = signal(MIN_BOXES);
  /** Typed by the user; tags have no data model of their own yet. */
  protected readonly tags = signal<readonly string[]>([]);
  protected readonly selectedTags = signal<ReadonlySet<string>>(new Set());

  protected readonly sprue = computed(() => sprueMinis(this.kit()));
  protected readonly kitCounts = computed(() => kitRowCounts(this.kit()));
  /** Minis per box of each row. */
  protected readonly rows = linkedSignal(() => (this.areSprues() ? this.kitCounts().map(() => 0) : this.kitCounts()));
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
