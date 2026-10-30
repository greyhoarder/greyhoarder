import { inject, Injectable } from '@angular/core';
import type { Mini } from '@greyhoarder/domain/hoard';
import { MinisStore } from '../data/minis-store';
import { PartsStore } from '../data/parts-store';
import type { ChangedMinis } from '../models/changed-minis';

/**
 * Takes in what the server answered to a change of minis. The server deletes the terms of the
 * vocabulary no mini carries any more (docs/domains/hoard.md, Parts), so every change of minis
 * loads the vocabulary anew; that way no use case can forget it.
 */
@Injectable({ providedIn: 'root' })
export class HoardChanges {
  private readonly minisStore = inject(MinisStore);
  private readonly partsStore = inject(PartsStore);

  /** The minis were deleted, and the server changed these others because of it. */
  removed(ids: readonly string[], changed: readonly Mini[]): void {
    this.minisStore.remove(ids);
    this.changed({ minis: changed, ownFactionNames: new Map() });
  }

  /** The server stored these minis. */
  changed({ minis, ownFactionNames }: ChangedMinis): void {
    this.minisStore.apply(minis, ownFactionNames);
    this.partsStore.reload();
  }
}
