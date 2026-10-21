/** The first administrator can only be created while no account exists (ADR-0007). */
export class AccountsAlreadyExistError extends Error {
  constructor() {
    super('This instance is already set up.');
  }
}
