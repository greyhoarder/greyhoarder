import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { SetupStatusResponse } from '@greyhoarder/protocol/auth';
import { firstValueFrom } from 'rxjs';

/** Talks to `auth/setup` on the server. */
@Injectable({ providedIn: 'root' })
export class HttpSetupAdapter {
  private readonly http = inject(HttpClient);

  async isSetupRequired(): Promise<boolean> {
    const status = await firstValueFrom(this.http.get<SetupStatusResponse>('/api/auth/setup'));
    return status.required;
  }
}
