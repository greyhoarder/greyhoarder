import { Injectable } from '@nestjs/common';
import { hash, verify } from '@node-rs/argon2';
import { PasswordHasher } from '../ports/password-hasher.js';

/** Argon2id with the library defaults (19 MiB, 2 passes). */
@Injectable()
export class Argon2PasswordHasher extends PasswordHasher {
  private readonly placeholderHash = hash('placeholder-for-unknown-users');

  hash(password: string): Promise<string> {
    return hash(password);
  }

  verify(passwordHash: string, password: string): Promise<boolean> {
    return verify(passwordHash, password);
  }

  async spendVerificationTime(password: string): Promise<void> {
    await verify(await this.placeholderHash, password);
  }
}
