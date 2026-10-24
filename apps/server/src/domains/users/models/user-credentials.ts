import type { User } from '@greyhoarder/domain/users';

/** A user together with the password hash; only `auth` receives it, to verify a sign-in. */
export interface UserCredentials {
  readonly user: User;
  readonly passwordHash: string;
}
