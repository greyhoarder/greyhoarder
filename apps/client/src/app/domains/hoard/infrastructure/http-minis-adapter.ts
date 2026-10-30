import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Mini } from '@greyhoarder/domain/hoard';
import type {
  AddMinisRequest,
  AddMinisResponse,
  DeleteMinisRequest,
  DeleteMinisResponse,
  MinisResponse,
  UpdateMinisRequest,
  UpdateMinisResponse,
} from '@greyhoarder/protocol/hoard';
import { firstValueFrom } from 'rxjs';
import type { ChangedMinis } from '../models/changed-minis';
import type { MiniChanges } from '../models/mini-changes';
import type { MinisToAdd } from '../models/minis-to-add';

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
    /** The faction each faction is part of, up the whole chain, by faction id. */
    readonly partOf: ReadonlyMap<string, string>;
  }> {
    const response = await firstValueFrom(this.http.get<MinisResponse>('/api/hoard/minis'));
    return {
      minis: response.minis,
      factionNames: new Map(Object.entries(response.factionNames)),
      systemNames: new Map(Object.entries(response.systemNames)),
      partOf: new Map(Object.entries(response.partOf)),
    };
  }

  /** Adds alike minis without a box; part names the vocabulary lacks are added to it. */
  async add(minis: MinisToAdd): Promise<readonly Mini[]> {
    const body: AddMinisRequest = minis;
    const response = await firstValueFrom(this.http.post<AddMinisResponse>('/api/hoard/minis', body));
    return response.minis;
  }

  /**
   * Applies the changes to every given mini alike; part names the vocabulary lacks are added to it,
   * faction names to the user's own factions.
   */
  async update(ids: readonly string[], changes: MiniChanges): Promise<ChangedMinis> {
    const body: UpdateMinisRequest = { ids, set: changes };
    const response = await firstValueFrom(this.http.patch<UpdateMinisResponse>('/api/hoard/minis', body));
    return {
      minis: response.minis,
      ownFactionNames: new Map(Object.entries(response.ownFactionNames)),
    };
  }

  /**
   * Deletes the minis for good; the server takes them out of other minis' recipients and keeps
   * their boxes, also empty ones.
   */
  async delete(ids: readonly string[]): Promise<{
    /** The boxes left without any minis, gone ones included. */
    readonly emptiedBoxIds: readonly string[];
    /** Other minis changed by it. */
    readonly minis: readonly Mini[];
  }> {
    const body: DeleteMinisRequest = { ids };
    return firstValueFrom(this.http.delete<DeleteMinisResponse>('/api/hoard/minis', { body }));
  }
}
