import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { FactionSearchRequest, FactionSearchResponse } from '@greyhoarder/protocol/catalog';
import { firstValueFrom } from 'rxjs';
import type { FoundFaction } from '../models/found-faction';

/** Talks to `catalog/factions` on the server. */
@Injectable({ providedIn: 'root' })
export class HttpCatalogFactionsAdapter {
  private readonly http = inject(HttpClient);

  /** The catalog factions whose name contains the text, ignoring case, sorted by name. */
  async search(text: string): Promise<readonly FoundFaction[]> {
    const params: FactionSearchRequest = { search: text };
    const response = await firstValueFrom(this.http.get<FactionSearchResponse>('/api/catalog/factions', { params }));
    return response.factions;
  }
}
