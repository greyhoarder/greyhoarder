import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type {
  CatalogMiniSearchRequest,
  CatalogMiniSearchResponse,
} from '@greyhoarder/protocol/catalog';
import { firstValueFrom } from 'rxjs';
import type { CatalogMiniSearchResult } from '../models/catalog-mini-search-result';

/** Talks to `catalog/minis` on the server. */
@Injectable({ providedIn: 'root' })
export class HttpCatalogMinisAdapter {
  private readonly http = inject(HttpClient);

  /** The catalog minis whose name, or the name of a kit they come from, contains the text, ignoring case. */
  async search(text: string): Promise<CatalogMiniSearchResult> {
    const params: CatalogMiniSearchRequest = { search: text };
    const response = await firstValueFrom(
      this.http.get<CatalogMiniSearchResponse>('/api/catalog/minis', { params }),
    );
    return {
      minis: response.minis,
      factionNames: new Map(Object.entries(response.factionNames)),
      systemNames: new Map(Object.entries(response.systemNames)),
    };
  }
}
