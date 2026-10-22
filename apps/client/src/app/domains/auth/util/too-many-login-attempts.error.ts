/** The server paused signing in after too many failed attempts. */
export class TooManyLoginAttemptsError extends Error {
  constructor() {
    super('Too many sign-in attempts.');
    this.name = 'TooManyLoginAttemptsError';
  }
}
