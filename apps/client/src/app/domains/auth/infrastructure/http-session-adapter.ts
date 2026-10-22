import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { User } from '@greyhoarder/domain/users';
import type { LoginRequest, SessionResponse } from '@greyhoarder/protocol/auth';
import { firstValueFrom } from 'rxjs';
import { InvalidCredentialsError } from '../util/invalid-credentials.error';
import { ServerUnreachableError } from '../util/server-unreachable.error';
import { TooManyLoginAttemptsError } from '../util/too-many-login-attempts.error';
import { hasStatus, isUnreachable } from './http-status';

export interface Credentials {
  readonly username: string;
  readonly password: string;
  readonly keepSignedIn: boolean;
}

/** The user of a session, as far as the server shares it with the client. */
export type SessionUser = Pick<User, 'id' | 'username' | 'role'>;

/** Talks to `auth/session` on the server. */
@Injectable({ providedIn: 'root' })
export class HttpSessionAdapter {
  private readonly http = inject(HttpClient);

  /**
   * Rejects with `InvalidCredentialsError` or `TooManyLoginAttemptsError` when the server refuses,
   * and with `ServerUnreachableError` when it does not answer.
   */
  async signIn(credentials: Credentials): Promise<SessionUser> {
    const request: LoginRequest = { ...credentials };
    try {
      const session = await firstValueFrom(
        this.http.post<SessionResponse>('/api/auth/session', request),
      );
      return session.user;
    } catch (error) {
      throw toSignInError(error);
    }
  }

  async signOut(): Promise<void> {
    await firstValueFrom(this.http.delete<void>('/api/auth/session'));
  }

  /** `undefined` without a valid session. */
  async currentUser(): Promise<SessionUser | undefined> {
    try {
      const session = await firstValueFrom(this.http.get<SessionResponse>('/api/auth/session'));
      return session.user;
    } catch (error) {
      if (hasStatus(error, HttpStatusCode.Unauthorized)) {
        return undefined;
      }
      throw error;
    }
  }
}

function toSignInError(error: unknown): unknown {
  if (hasStatus(error, HttpStatusCode.Unauthorized)) {
    return new InvalidCredentialsError();
  }
  if (hasStatus(error, HttpStatusCode.TooManyRequests)) {
    return new TooManyLoginAttemptsError();
  }
  if (isUnreachable(error)) {
    return new ServerUnreachableError();
  }
  return error;
}
