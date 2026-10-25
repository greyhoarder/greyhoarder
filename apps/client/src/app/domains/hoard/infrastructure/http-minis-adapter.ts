import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Mini } from '@greyhoarder/domain/hoard';
import type {
  MinisResponse,
  UpdateMinisRequest,
  UpdateMinisResponse,
} from '@greyhoarder/protocol/hoard';
import { firstValueFrom } from 'rxjs';
import type { MiniChanges } from '../models/mini-changes';

/** Talks to `hoard/minis` on the server. */
@Injectable({ providedIn: 'root' })
export class HttpMinisAdapter {
  private readonly http = inject(HttpClient);

  /** Every mini of the signed-in user, with the names of the factions they refer to and of their game systems. */
  async list(): Promise<{
    readonly minis: readonly Mini[];
    readonly factionNames: ReadonlyMap<string, string>;
    /** By faction id. */
    readonly systemNames: ReadonlyMap<string, string>;
  }> {
    const response = await firstValueFrom(this.http.get<MinisResponse>('/api/hoard/minis'));
    return {
      minis: response.minis,
      factionNames: new Map(Object.entries(response.factionNames)),
      systemNames: new Map(Object.entries(response.systemNames)),
    };
  }

  /** Applies the changes to every given mini alike; part names the vocabulary lacks are added to it. */
  async update(ids: readonly string[], changes: MiniChanges): Promise<readonly Mini[]> {
    const body: UpdateMinisRequest = { ids, set: changes };
    const response = await firstValueFrom(
      this.http.patch<UpdateMinisResponse>('/api/hoard/minis', body),
    );
    return response.minis;
  }
}
