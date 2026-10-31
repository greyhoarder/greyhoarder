/**
 * Parts changed on minis of different names: only minis of the same name are changed together there
 * (docs/domains/hoard.md, Lists of minis).
 */
export class PartsOfDifferentMinisError extends Error {
  constructor() {
    super('Parts can be changed together only on minis of the same name.');
    this.name = 'PartsOfDifferentMinisError';
  }
}
