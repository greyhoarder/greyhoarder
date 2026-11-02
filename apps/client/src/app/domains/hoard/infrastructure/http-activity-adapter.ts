import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { ActivityResponse } from '@greyhoarder/protocol/hoard';
import { firstValueFrom } from 'rxjs';
import type { ActivityOverview } from '../models/activity';

/** Talks to `hoard/activity` on the server. */
@Injectable({ providedIn: 'root' })
export class HttpActivityAdapter {
  private readonly http = inject(HttpClient);

  /** The last year of the signed-in user's hoard. */
  overview(): Promise<ActivityOverview> {
    return firstValueFrom(this.http.get<ActivityResponse>('/api/hoard/activity'));
  }
}
