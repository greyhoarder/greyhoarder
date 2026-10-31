import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Box, Mini } from '@greyhoarder/domain/hoard';
import type {
  AddBoxesRequest,
  AddBoxesResponse,
  BoxesResponse,
  DeleteBoxesRequest,
  DeleteBoxesResponse,
  EditBoxRowsRequest,
  EditBoxRowsResponse,
} from '@greyhoarder/protocol/hoard';
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

  /**
   * Boxes of the catalog kit's latest version with the chosen name, each with the minis of the
   * counted rows on the sprue, or those the kit puts there.
   */
  async add(
    kitId: string,
    boxesToAdd: BoxesToAdd,
    addedOn: string,
  ): Promise<{ readonly boxes: readonly Box[]; readonly minis: readonly Mini[] }> {
    const body: AddBoxesRequest = { kitId, ...boxesToAdd, addedOn };
    return firstValueFrom(this.http.post<AddBoxesResponse>('/api/hoard/boxes', body));
  }

  /**
   * Deletes the boxes for good with all their minis, gone ones included, or keeps those past the
   * sprue in the hoard without a box when asked; their minis on the sprue always go with them.
   */
  async delete(
    ids: readonly string[],
    { keepBuiltMinis = false }: { readonly keepBuiltMinis?: boolean } = {},
  ): Promise<{
    /** The boxes' minis deleted with them. */
    readonly deletedMiniIds: readonly string[];
    /** Other minis that changed: kept minis now without a box, and those whose recipients lost deleted ones. */
    readonly minis: readonly Mini[];
  }> {
    const body: DeleteBoxesRequest = { ids, keepBuiltMinis };
    return firstValueFrom(this.http.delete<DeleteBoxesResponse>('/api/hoard/boxes', { body }));
  }

  /** Counts the minis on the sprue of the box anew, per row of its kit; the box becomes an edited box. */
  async editRows(
    id: string,
    rows: readonly number[],
  ): Promise<{
    readonly box: Box;
    /** Minis put on the sprue of raised rows. */
    readonly addedMinis: readonly Mini[];
    /** Minis on the sprue of lowered rows, deleted for good. */
    readonly deletedMiniIds: readonly string[];
    /** Other minis that no longer name a deleted mini as a recipient of their parts. */
    readonly minis: readonly Mini[];
  }> {
    const body: EditBoxRowsRequest = { rows };
    return firstValueFrom(this.http.put<EditBoxRowsResponse>(`/api/hoard/boxes/${encodeURIComponent(id)}/rows`, body));
  }
}
