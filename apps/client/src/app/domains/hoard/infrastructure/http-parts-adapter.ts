import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Part } from '@greyhoarder/domain/hoard';
import type { PartsResponse } from '@greyhoarder/protocol/hoard';
import { firstValueFrom } from 'rxjs';

/** Talks to `hoard/parts` on the server. */
@Injectable({ providedIn: 'root' })
export class HttpPartsAdapter {
  private readonly http = inject(HttpClient);

  /** The signed-in user's vocabulary of parts. */
  async list(): Promise<readonly Part[]> {
    const response = await firstValueFrom(this.http.get<PartsResponse>('/api/hoard/parts'));
    return response.parts;
  }
}
