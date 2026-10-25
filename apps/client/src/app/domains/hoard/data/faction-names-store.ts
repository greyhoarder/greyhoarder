import { Injectable, signal } from '@angular/core';

/** The names of the factions boxes and minis refer to, by id, as the server delivers them with the hoard. */
@Injectable({ providedIn: 'root' })
export class FactionNamesStore {
  private readonly allNames = signal<ReadonlyMap<string, string>>(new Map());
  readonly names = this.allNames.asReadonly();

  add(names: ReadonlyMap<string, string>): void {
    this.allNames.update((current) => new Map([...current, ...names]));
  }
}
