/** A box is created with at least one mini (docs/domains/hoard.md, Boxes and kits). */
export class EmptyBoxError extends Error {
  constructor() {
    super('A box needs at least one mini.');
    this.name = 'EmptyBoxError';
  }
}
