/** The box is not in the user's hoard, also when it is another user's. */
export class UnknownBoxError extends Error {
  constructor() {
    super('This box is not in your hoard.');
    this.name = 'UnknownBoxError';
  }
}
