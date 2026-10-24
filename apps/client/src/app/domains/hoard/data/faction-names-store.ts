import { Injectable, signal } from '@angular/core';
import { SAMPLE_FACTION_NAMES } from './sample-boxes';

/**
 * The names of the factions boxes and minis refer to, by id. Filled from what the catalog
 * search returns until the server delivers the factions of the hoard.
 */
@Injectable({ providedIn: 'root' })
export class FactionNamesStore {
  private readonly allNames = signal<ReadonlyMap<string, string>>(SAMPLE_FACTION_NAMES);
  readonly names = this.allNames.asReadonly();

  add(names: ReadonlyMap<string, string>): void {
    this.allNames.update((current) => new Map([...current, ...names]));
  }
}
