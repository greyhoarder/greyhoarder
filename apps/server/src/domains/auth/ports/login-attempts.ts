/** Failed sign-ins and locks per subject, i.e. a client IP or a username. */
export abstract class LoginAttempts {
  /** Remaining lock time in milliseconds; 0 when not locked. */
  abstract lockedForMs(subject: string): Promise<number>;

  /** Counts a failure within the current window and returns the new count. */
  abstract recordFailure(subject: string): Promise<number>;

  abstract lock(subject: string, durationMs: number): Promise<void>;

  abstract reset(subject: string): Promise<void>;
}
