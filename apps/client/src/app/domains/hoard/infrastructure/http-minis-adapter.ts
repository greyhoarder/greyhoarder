import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Mini } from '@greyhoarder/domain/hoard';
import type { MinisResponse } from '@greyhoarder/protocol/hoard';
import { firstValueFrom } from 'rxjs';

/** Talks to `hoard/minis` on the server. */
@Injectable({ providedIn: 'root' })
export class HttpMinisAdapter {
  private readonly http = inject(HttpClient);

  /** Every mini of the signed-in user, with the names of the factions they refer to. */
  async list(): Promise<{
    readonly minis: readonly Mini[];
    readonly factionNames: ReadonlyMap<string, string>;
  }> {
    const response = await firstValueFrom(this.http.get<MinisResponse>('/api/hoard/minis'));
    return { minis: response.minis, factionNames: new Map(Object.entries(response.factionNames)) };
  }
}
