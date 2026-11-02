import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Language } from '@greyhoarder/domain/users';
import type { SessionResponse, SetAvatarRequest, UpdateProfileRequest } from '@greyhoarder/protocol/auth';
import { firstValueFrom } from 'rxjs';
import type { SessionUser } from './http-session-adapter';

/** Talks to `users/me` on the server; each call answers with the user as stored afterwards. */
@Injectable({ providedIn: 'root' })
export class HttpProfileAdapter {
  private readonly http = inject(HttpClient);

  /** An empty display name removes it. */
  async update(changes: { readonly displayName?: string; readonly language?: Language }): Promise<SessionUser> {
    const body: UpdateProfileRequest = changes;

    return (await firstValueFrom(this.http.patch<SessionResponse>('/api/users/me', body))).user;
  }

  async setAvatar(image: string): Promise<SessionUser> {
    const body: SetAvatarRequest = { image };

    return (await firstValueFrom(this.http.put<SessionResponse>('/api/users/me/avatar', body))).user;
  }

  async removeAvatar(): Promise<SessionUser> {
    return (await firstValueFrom(this.http.delete<SessionResponse>('/api/users/me/avatar'))).user;
  }
}
