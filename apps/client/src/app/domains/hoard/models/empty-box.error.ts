/** A box always has at least one mini (docs/domains/hoard.md). */
export class EmptyBoxError extends Error {
  constructor() {
    super('A box needs at least one mini.');
    this.name = 'EmptyBoxError';
  }
}
