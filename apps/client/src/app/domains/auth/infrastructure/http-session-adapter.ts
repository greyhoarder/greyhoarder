import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { User } from '@greyhoarder/domain/users';
import type { ChangePasswordRequest, LoginRequest, SessionResponse } from '@greyhoarder/protocol/auth';
import { firstValueFrom } from 'rxjs';
import { InvalidCredentialsError } from '../util/invalid-credentials.error';
import { ServerUnreachableError } from '../../../shared/http/server-unreachable.error';
import { TooManyLoginAttemptsError } from '../util/too-many-login-attempts.error';
import { WrongPasswordError } from '../util/wrong-password.error';
import { hasStatus, isUnreachable } from './http-status';

export interface Credentials {
  readonly username: string;
  readonly password: string;
  readonly keepSignedIn: boolean;
}

/** The user of a session, as far as the server shares it with the client. */
export type SessionUser = Pick<User, 'id' | 'username' | 'role' | 'displayName' | 'language' | 'avatarId'>;

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
      const session = await firstValueFrom(this.http.post<SessionResponse>('/api/auth/session', request));
      return session.user;
    } catch (error) {
      throw toSignInError(error);
    }
  }

  async signOut(): Promise<void> {
    await firstValueFrom(this.http.delete<void>('/api/auth/session'));
  }

  /** Signs the user's other devices out; this one stays signed in. */
  async signOutOthers(): Promise<void> {
    await firstValueFrom(this.http.delete<void>('/api/auth/session/others'));
  }

  /**
   * Replaces the password and ends the other sessions. Rejects with `WrongPasswordError` or
   * `TooManyLoginAttemptsError` when the server refuses.
   */
  async changePassword(request: ChangePasswordRequest): Promise<void> {
    try {
      await firstValueFrom(this.http.put<void>('/api/auth/session/password', request));
    } catch (error) {
      if (hasStatus(error, HttpStatusCode.UnprocessableEntity)) {
        throw new WrongPasswordError();
      }
      throw hasStatus(error, HttpStatusCode.TooManyRequests) ? new TooManyLoginAttemptsError() : error;
    }
  }

  /** `undefined` without a valid session; rejects with `ServerUnreachableError` when the server does not answer. */
  async currentUser(): Promise<SessionUser | undefined> {
    try {
      const session = await firstValueFrom(this.http.get<SessionResponse>('/api/auth/session'));
      return session.user;
    } catch (error) {
      if (hasStatus(error, HttpStatusCode.Unauthorized)) {
        return undefined;
      }
      throw isUnreachable(error) ? new ServerUnreachableError() : error;
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
