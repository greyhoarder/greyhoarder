export type AdministratorField = 'username' | 'password';

/** The server rejected the username or password of the first administrator. */
export class InvalidAdministratorError extends Error {
  /** The server's message per rejected field, meant to be shown below that field. */
  constructor(readonly messages: Readonly<Partial<Record<AdministratorField, string>>>) {
    super('The server rejected the administrator account.');
    this.name = 'InvalidAdministratorError';
  }
}
