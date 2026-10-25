/** No catalog kit with this id is offered, or it was removed from the catalog. */
export class UnknownKitError extends Error {
  constructor(readonly kitId: string) {
    super(`There is no kit ${kitId} in the catalog.`);
    this.name = 'UnknownKitError';
  }
}
