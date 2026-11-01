/** An account with this username exists already, whatever its case. */
export class UsernameTakenError extends Error {
  constructor() {
    super('This username is taken.');
    this.name = 'UsernameTakenError';
  }
}
