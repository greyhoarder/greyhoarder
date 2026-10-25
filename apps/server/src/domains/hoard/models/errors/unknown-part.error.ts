/** A part refers to an id that is not in the user's vocabulary. */
export class UnknownPartError extends Error {
  constructor() {
    super('Not every part is in your vocabulary.');
    this.name = 'UnknownPartError';
  }
}
