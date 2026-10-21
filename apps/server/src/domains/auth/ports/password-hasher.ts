/** One-way hashing of passwords (Argon2id, ADR-0007). */
export abstract class PasswordHasher {
  abstract verify(passwordHash: string, password: string): Promise<boolean>;

  /**
   * Takes as long as `verify`. Used for unknown usernames, so response times
   * don't reveal whether a username exists (ADR-0009).
   */
  abstract spendVerificationTime(password: string): Promise<void>;
}
