/** The current password given to change it is wrong. */
export class WrongPasswordError extends Error {
  constructor() {
    super('The current password is wrong.');
    this.name = 'WrongPasswordError';
  }
}
