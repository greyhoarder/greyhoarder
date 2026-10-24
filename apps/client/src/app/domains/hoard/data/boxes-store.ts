import { Injectable, signal } from '@angular/core';
import type { Box } from '../models/box';
import { SAMPLE_BOXES } from './sample-boxes';

/** The boxes of the hoard, shared by adding boxes and the lists of the hoard. */
@Injectable({ providedIn: 'root' })
export class BoxesStore {
  private readonly allBoxes = signal<readonly Box[]>(SAMPLE_BOXES);
  readonly boxes = this.allBoxes.asReadonly();

  add(boxes: readonly Box[]): void {
    this.allBoxes.update((current) => [...current, ...boxes]);
  }
}
