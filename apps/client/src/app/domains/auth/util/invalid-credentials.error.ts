/** The username is unknown or the password is wrong; the server does not say which. */
export class InvalidCredentialsError extends Error {
  constructor() {
    super('Username or password is incorrect.');
    this.name = 'InvalidCredentialsError';
  }
}
