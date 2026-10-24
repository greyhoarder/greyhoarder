import { planCatalogUpdate } from './catalog-update.js';
import type { VersionedEntry } from './versioned-entry.js';

interface Entry {
  readonly id: string;
  readonly name: string;
  readonly factionIds: readonly string[];
  readonly supersedesId?: string;
}

const ORKS = 'warhammer-40000/orks';
const GROTS = 'warhammer-40000/grots';

function entry(id: string, name = id, factionIds: readonly string[] = [ORKS]): Entry {
  return { id, name, factionIds };
}

function imported(current: Entry, version = 1, isRemoved = false): VersionedEntry<Entry> {
  return { entry: current, version, isRemoved };
}

describe('Catalog update', () => {
  it('gives a new entry version 1', () => {
    const boyz = entry('boyz');

    const update = planCatalogUpdate([], [boyz]);

    expect(update.versions).toEqual([{ entry: boyz, version: 1 }]);
  });

  it('gives a changed entry the next version and leaves unchanged ones alone', () => {
    const changedBoyz = entry('boyz', 'Boyz, corrected');

    const update = planCatalogUpdate([imported(entry('boyz'), 2), imported(entry('nobz'))], [changedBoyz, entry('nobz')]);

    expect(update.versions).toEqual([{ entry: changedBoyz, version: 3 }]);
  });

  it('marks an entry missing from the snapshot as removed', () => {
    const update = planCatalogUpdate([imported(entry('boyz')), imported(entry('nobz'))], [entry('nobz')]);

    expect(update.removedIds).toEqual(['boyz']);
  });

  it('does not mark an entry as removed while its file is broken', () => {
    const update = planCatalogUpdate([imported(entry('boyz'))], [], ['boyz']);

    expect(update.removedIds).toEqual([]);
  });

  it('restores a removed entry that is back unchanged', () => {
    const update = planCatalogUpdate([imported(entry('boyz'), 1, true)], [entry('boyz')]);

    expect(update).toEqual({ versions: [], removedIds: [], restoredIds: ['boyz'] });
  });

  it('does not count another key order or left-out optional fields as a change', () => {
    const stored: Entry = { supersedesId: undefined, factionIds: [ORKS], name: 'Boyz', id: 'boyz' };

    const update = planCatalogUpdate([imported(stored)], [entry('boyz', 'Boyz')]);

    expect(update.versions).toEqual([]);
  });

  it('counts another order within a list as a change', () => {
    const swapped = entry('boyz', 'Boyz', [GROTS, ORKS]);

    const update = planCatalogUpdate([imported(entry('boyz', 'Boyz', [ORKS, GROTS]))], [swapped]);

    expect(update.versions).toEqual([{ entry: swapped, version: 2 }]);
  });

  it('plans nothing for the same snapshot twice', () => {
    const update = planCatalogUpdate([imported(entry('boyz')), imported(entry('nobz'))], [entry('boyz'), entry('nobz')]);

    expect(update).toEqual({ versions: [], removedIds: [], restoredIds: [] });
  });
});
