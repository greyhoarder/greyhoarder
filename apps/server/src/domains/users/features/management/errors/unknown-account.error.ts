/** There is no such account. */
export class UnknownAccountError extends Error {
  constructor() {
    super('This account does not exist.');
    this.name = 'UnknownAccountError';
  }
}
