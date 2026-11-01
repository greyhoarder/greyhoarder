/** The change would leave the instance without an active administrator. */
export class LastAdministratorError extends Error {
  constructor() {
    super('This is the last active administrator.');
    this.name = 'LastAdministratorError';
  }
}
