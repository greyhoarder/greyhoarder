import { computed, inject, Injectable, resource } from '@angular/core';
import { HttpPartsAdapter } from '../infrastructure/http-parts-adapter';
import type { VocabularyPart } from '../models/part-options';

/** The user's vocabulary of parts as the server has it, which names the parts of every mini. */
@Injectable({ providedIn: 'root' })
export class PartsStore {
  private readonly adapter = inject(HttpPartsAdapter);

  private readonly loaded = resource({ loader: () => this.adapter.list() });

  /** Empty until loaded, and when it can't be loaded: minis then show no part names. */
  readonly parts = computed<readonly VocabularyPart[]>(() =>
    this.loaded.hasValue() ? this.loaded.value() : [],
  );
  /** The name of each part, by id. */
  readonly names = computed(() => new Map(this.parts().map((part) => [part.id, part.name])));

  /** Fetches the vocabulary again, e.g. after a change added parts to it. */
  reload(): void {
    this.loaded.reload();
  }
}
