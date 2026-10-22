import { HttpClient, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { SetupRequest, SetupStatusResponse } from '@greyhoarder/protocol/auth';
import { firstValueFrom } from 'rxjs';
import { AccountsAlreadyExistError } from '../util/accounts-already-exist.error';
import { type AdministratorField, InvalidAdministratorError } from '../util/invalid-administrator.error';
import { ServerUnreachableError } from '../util/server-unreachable.error';
import { hasStatus, isUnreachable } from './http-status';

/** Talks to `auth/setup` on the server. */
@Injectable({ providedIn: 'root' })
export class HttpSetupAdapter {
  private readonly http = inject(HttpClient);

  async isSetupRequired(): Promise<boolean> {
    const status = await firstValueFrom(this.http.get<SetupStatusResponse>('/api/auth/setup'));
    return status.required;
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
      throw toSetupError(error);
    }
  }
}

function toSetupError(error: unknown): unknown {
  if (error instanceof HttpErrorResponse && error.status === HttpStatusCode.BadRequest) {
    return new InvalidAdministratorError(fieldMessages(error.error));
  }
  if (hasStatus(error, HttpStatusCode.Conflict)) {
    return new AccountsAlreadyExistError();
  }
  if (isUnreachable(error)) {
    return new ServerUnreachableError();
  }
  return error;
}

/** The first message per field from the server's validation errors (`errors[].path`, `errors[].message`). */
function fieldMessages(body: unknown): Partial<Record<AdministratorField, string>> {
  const messages: Partial<Record<AdministratorField, string>> = {};
  const errors: unknown[] = isRecord(body) && Array.isArray(body['errors']) ? body['errors'] : [];
  for (const entry of errors) {
    const field: unknown = isRecord(entry) && Array.isArray(entry['path']) ? entry['path'][0] : undefined;
    const message = isRecord(entry) ? entry['message'] : undefined;
    if ((field === 'username' || field === 'password') && typeof message === 'string') {
      messages[field] ??= message;
    }
  }
  return messages;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
