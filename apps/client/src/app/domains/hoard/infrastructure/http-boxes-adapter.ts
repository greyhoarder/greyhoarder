import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Box, Mini } from '@greyhoarder/domain/hoard';
import type { AddBoxesRequest, AddBoxesResponse, BoxesResponse, DeleteBoxResponse } from '@greyhoarder/protocol/hoard';
import { firstValueFrom } from 'rxjs';
import type { BoxesToAdd } from '../models/boxes-to-add';

/** Talks to `hoard/boxes` on the server. */
@Injectable({ providedIn: 'root' })
export class HttpBoxesAdapter {
  private readonly http = inject(HttpClient);

  /** Every box of the signed-in user, with the names of the factions they refer to. */
  async list(): Promise<{
    readonly boxes: readonly Box[];
    readonly factionNames: ReadonlyMap<string, string>;
  }> {
    const response = await firstValueFrom(this.http.get<BoxesResponse>('/api/hoard/boxes'));
    return { boxes: response.boxes, factionNames: new Map(Object.entries(response.factionNames)) };
  }

  /** Boxes of the catalog kit's latest version, each with the minis it puts on the sprue. */
  async add(
    kitId: string,
    boxesToAdd: BoxesToAdd,
    addedOn: string,
  ): Promise<{ readonly boxes: readonly Box[]; readonly minis: readonly Mini[] }> {
    const body: AddBoxesRequest = { kitId, ...boxesToAdd, addedOn };
    return firstValueFrom(this.http.post<AddBoxesResponse>('/api/hoard/boxes', body));
  }

  /** Deletes the box for good with all its minis, gone ones included. */
  async delete(id: string): Promise<{
    /** The box's minis. */
    readonly deletedMiniIds: readonly string[];
    /** Other minis whose recipients lost the deleted ones. */
    readonly minis: readonly Mini[];
  }> {
    return firstValueFrom(this.http.delete<DeleteBoxResponse>(`/api/hoard/boxes/${encodeURIComponent(id)}`));
  }
}
