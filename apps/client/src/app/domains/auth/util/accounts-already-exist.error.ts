/** Someone finished the setup first; the instance already has accounts. */
export class AccountsAlreadyExistError extends Error {
  constructor() {
    super('The instance already has accounts.');
    this.name = 'AccountsAlreadyExistError';
  }
}
