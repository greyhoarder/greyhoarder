import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { KitSearchRequest, KitSearchResponse } from '@greyhoarder/protocol/catalog';
import { firstValueFrom } from 'rxjs';
import type { KitSearchResult } from '../models/kit-search-result';

/** Talks to `catalog/kits` on the server. */
@Injectable({ providedIn: 'root' })
export class HttpKitsAdapter {
  private readonly http = inject(HttpClient);

  /** The kits whose name, product code or barcode contains the text, ignoring case. */
  async search(text: string): Promise<KitSearchResult> {
    const params: KitSearchRequest = { search: text };
    const response = await firstValueFrom(
      this.http.get<KitSearchResponse>('/api/catalog/kits', { params }),
    );
    return {
      kits: response.kits,
      containedKits: new Map(response.containedKits.map((kit) => [kit.id, kit])),
      factionNames: new Map(Object.entries(response.factionNames)),
    };
  }
}
