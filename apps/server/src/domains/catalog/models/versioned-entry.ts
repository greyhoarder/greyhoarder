/** The latest version of a catalog entry as imported so far. */
export interface VersionedEntry<T extends { readonly id: string }> {
  readonly entry: T;
  readonly version: number;
  readonly isRemoved: boolean;
}
