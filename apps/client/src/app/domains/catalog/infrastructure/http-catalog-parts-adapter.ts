import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { RangePartsRequest, RangePartsResponse } from '@greyhoarder/protocol/catalog';
import { firstValueFrom } from 'rxjs';

/** Talks to `catalog/parts` on the server. */
@Injectable({ providedIn: 'root' })
export class HttpCatalogPartsAdapter {
  private readonly http = inject(HttpClient);

  /** Every part the catalog kits of the factions and of the factions they are part of offer, by name. */
  async rangeParts(factionIds: readonly string[]): Promise<readonly string[]> {
    const params: RangePartsRequest = { factionIds: factionIds.join(',') };
    const response = await firstValueFrom(
      this.http.get<RangePartsResponse>('/api/catalog/parts', { params }),
    );
    return response.parts;
  }
}
