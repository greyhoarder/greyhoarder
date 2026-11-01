import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type {
  AccountResponse,
  AccountsResponse,
  AddAccountRequest,
  SetPasswordRequest,
  UpdateAccountRequest,
} from '@greyhoarder/protocol/auth';
import { firstValueFrom } from 'rxjs';
import { UsernameTakenError } from '../util/username-taken.error';
import { hasStatus } from './http-status';

/** An account as an administrator sees it. */
export type Account = AccountResponse;

/** Talks to `auth/accounts` on the server. */
@Injectable({ providedIn: 'root' })
export class HttpAccountsAdapter {
  private readonly http = inject(HttpClient);

  async list(): Promise<readonly Account[]> {
    return (await firstValueFrom(this.http.get<AccountsResponse>('/api/auth/accounts'))).users;
  }

  /** Rejects with `UsernameTakenError` when the name is taken. */
  async add(account: AddAccountRequest): Promise<void> {
    try {
      await firstValueFrom(this.http.post<void>('/api/auth/accounts', account));
    } catch (error) {
      throw hasStatus(error, HttpStatusCode.Conflict) ? new UsernameTakenError() : error;
    }
  }

  /** Rejects when the server refuses, e.g. for the last active administrator. */
  async update(id: string, changes: UpdateAccountRequest): Promise<Account> {
    return firstValueFrom(this.http.patch<AccountResponse>(`/api/users/accounts/${encodeURIComponent(id)}`, changes));
  }

  /** A forgotten password; the account's sessions end with it. */
  async setPassword(id: string, password: string): Promise<void> {
    const body: SetPasswordRequest = { password };
    await firstValueFrom(this.http.put<void>(`/api/auth/accounts/${encodeURIComponent(id)}/password`, body));
  }

  /** Deletes the account and its hoard for good. */
  async remove(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`/api/users/accounts/${encodeURIComponent(id)}`));
  }
}
