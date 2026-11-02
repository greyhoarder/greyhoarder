import { HttpClient, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { type SetupRequest, type SetupStatusResponse, validationErrorResponseSchema } from '@greyhoarder/protocol/auth';
import { firstValueFrom } from 'rxjs';
import { AccountsAlreadyExistError } from '../util/accounts-already-exist.error';
import { type AdministratorField, InvalidAdministratorError } from '../util/invalid-administrator.error';
import { ServerUnreachableError } from '../../../shared/http/server-unreachable.error';
import { hasStatus, isUnreachable } from './http-status';

/** Talks to `auth/setup` on the server. */
@Injectable({ providedIn: 'root' })
export class HttpSetupAdapter {
  private readonly http = inject(HttpClient);

  /** Rejects with `ServerUnreachableError` when the server does not answer. */
  async isSetupRequired(): Promise<boolean> {
    try {
      const status = await firstValueFrom(this.http.get<SetupStatusResponse>('/api/auth/setup'));

      return status.required;
    } catch (error) {
      throw isUnreachable(error) ? new ServerUnreachableError() : error;
    }
  }

  /**
   * Rejects with `InvalidAdministratorError` or `AccountsAlreadyExistError` when the server refuses,
   * and with `ServerUnreachableError` when it does not answer.
   */
  async createAdministrator(username: string, password: string): Promise<void> {
    const request: SetupRequest = { username, password };

    try {
      await firstValueFrom(this.http.post<void>('/api/auth/setup', request));
    } catch (error) {
      throwSetupError(error);
    }
  }
}

/** Throws the error the server's answer means, or the cause itself when it means none of them. */
function throwSetupError(cause: unknown): never {
  if (cause instanceof HttpErrorResponse && cause.status === HttpStatusCode.BadRequest) {
    throw new InvalidAdministratorError(fieldMessages(cause));
  }

  if (hasStatus(cause, HttpStatusCode.Conflict)) {
    throw new AccountsAlreadyExistError();
  }

  if (isUnreachable(cause)) {
    throw new ServerUnreachableError();
  }

  throw cause;
}

/** The first message per field from the server's validation errors. */
function fieldMessages(response: HttpErrorResponse): Partial<Record<AdministratorField, string>> {
  const parsed = validationErrorResponseSchema.safeParse(response.error);
  const messages: Partial<Record<AdministratorField, string>> = {};

  for (const { path, message } of parsed.success ? parsed.data.errors : []) {
    const [field] = path;

    if (field === 'username' || field === 'password') {
      messages[field] ??= message;
    }
  }

  return messages;
}
