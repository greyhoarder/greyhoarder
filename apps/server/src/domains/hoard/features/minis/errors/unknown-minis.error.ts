/** One of the minis is not in the user's hoard, also when it is another user's. */
export class UnknownMinisError extends Error {
  constructor() {
    super('Not every mini is in your hoard.');
    this.name = 'UnknownMinisError';
  }
}
