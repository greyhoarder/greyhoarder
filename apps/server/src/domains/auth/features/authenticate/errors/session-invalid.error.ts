/** The session is not registered, or its account is gone or disabled. */
export class SessionInvalidError extends Error {
  constructor() {
    super('The session is no longer valid.');
  }
}
