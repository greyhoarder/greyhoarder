import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { PartsResponse } from '@greyhoarder/protocol/hoard';
import { firstValueFrom } from 'rxjs';
import type { VocabularyPart } from '../models/part-options';

/** Talks to `hoard/parts` on the server. */
@Injectable({ providedIn: 'root' })
export class HttpPartsAdapter {
  private readonly http = inject(HttpClient);

  /** The signed-in user's vocabulary of parts, each telling whether it comes from the catalog. */
  async list(): Promise<readonly VocabularyPart[]> {
    const response = await firstValueFrom(this.http.get<PartsResponse>('/api/hoard/parts'));
    return response.parts;
  }
}
