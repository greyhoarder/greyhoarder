import { Component, computed, input, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMinus, lucidePlus } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { type BoxesToAdd, MIN_BOXES, parseBoxesToAdd } from '../../../models/boxes-to-add';
import { sprueMinis } from '../../../models/sprue-minis';
import type { Kit } from '../../../models/kit';

/**
 * What to add of a kit: the minis it puts on the sprue, tags and how many boxes. A new form
 * starts with one box and no tags; what the minis become is decided when they are built.
 */
@Component({
  selector: 'app-box-form',
  imports: [NgIcon, HlmButton],
  providers: [provideIcons({ lucideMinus, lucidePlus })],
  templateUrl: './box-form.html',
  host: { class: 'flex flex-col gap-4 px-3 pb-4 sm:px-5' },
})
export class BoxForm {
  private static nextId = 0;

  readonly kit = input.required<Kit>();
  readonly add = output<BoxesToAdd>();

  protected readonly idPrefix = `box-form-${BoxForm.nextId++}`;

  protected readonly boxes = signal(MIN_BOXES);
  /** Typed by the user; tags have no data model of their own yet. */
  protected readonly tags = signal<readonly string[]>([]);
  protected readonly selectedTags = signal<ReadonlySet<string>>(new Set());

  protected readonly sprue = computed(() => sprueMinis(this.kit()));
  protected readonly minis = computed(() => this.kit().minis * this.boxes());

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
        tags: this.tags().filter((tag) => this.selectedTags().has(tag)),
      }),
    );
  }
}
