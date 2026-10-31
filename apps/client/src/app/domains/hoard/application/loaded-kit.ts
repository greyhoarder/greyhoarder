import { computed, inject, resource, type Signal } from '@angular/core';
import { type BoxKitReference, type Kit, toKit } from '@greyhoarder/domain/hoard';
import { HttpKitsAdapter } from '../../catalog/api';

/** The kit of a box or mini in the version it records, as it loads. */
export interface LoadedKit {
  /** Left out while loading, when it can't be loaded and without a reference. */
  readonly kit: Signal<Kit | undefined>;
  readonly isLoading: Signal<boolean>;
  readonly hasFailed: Signal<boolean>;
  /** The catalog answered, but without this version of the kit. */
  readonly isMissing: Signal<boolean>;
}

/** Loads the kit a reference names, anew when it changes; to call while constructing a class. */
export function loadedKit(reference: () => BoxKitReference | undefined): LoadedKit {
  const catalogKits = inject(HttpKitsAdapter);
  const loaded = resource({
    params: reference,
    loader: async ({ params: { id, version } }): Promise<Kit | undefined> => {
      const { kits, containedKits } = await catalogKits.find(id, version);
      return kits[0] && toKit(kits[0], containedKits);
    },
  });
  return {
    kit: computed(() => (loaded.hasValue() ? loaded.value() : undefined)),
    isLoading: computed(() => loaded.isLoading()),
    hasFailed: computed(() => loaded.error() !== undefined),
    isMissing: computed(() => loaded.status() === 'resolved' && loaded.value() === undefined),
  };
}
