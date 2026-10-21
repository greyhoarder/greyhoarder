export class TooManyLoginAttemptsError extends Error {
  constructor(readonly retryAfterMs: number) {
    super('Too many sign-in attempts. Try again later.');
  }
}
