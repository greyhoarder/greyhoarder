import { Injectable, signal } from '@angular/core';

/** The names of the factions boxes and minis refer to, by id, as the server delivers them with the hoard. */
@Injectable({ providedIn: 'root' })
export class FactionNamesStore {
  private readonly allNames = signal<ReadonlyMap<string, string>>(new Map());
  private readonly allSystemNames = signal<ReadonlyMap<string, string>>(new Map());
  readonly names = this.allNames.asReadonly();
  /** The names of the factions' game systems, by faction id. */
  readonly systemNames = this.allSystemNames.asReadonly();

  add(names: ReadonlyMap<string, string>): void {
    this.allNames.update((current) => new Map([...current, ...names]));
  }

  addSystemNames(systemNames: ReadonlyMap<string, string>): void {
    this.allSystemNames.update((current) => new Map([...current, ...systemNames]));
  }
}
