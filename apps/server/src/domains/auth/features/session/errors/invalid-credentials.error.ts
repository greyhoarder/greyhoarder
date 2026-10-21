/** Unknown username, wrong password or disabled account: deliberately one case (ADR-0009). */
export class InvalidCredentialsError extends Error {
  constructor() {
    super('Username or password is incorrect.');
  }
}
