import { Injectable, signal } from '@angular/core';
import type { Mini } from '../models/mini';
import { SAMPLE_MINIS } from './sample-minis';

/** The minis of the hoard, shared by adding boxes and the lists of the hoard. */
@Injectable({ providedIn: 'root' })
export class MinisStore {
  private readonly allMinis = signal<readonly Mini[]>(SAMPLE_MINIS);
  readonly minis = this.allMinis.asReadonly();

  add(minis: readonly Mini[]): void {
    this.allMinis.update((current) => [...current, ...minis]);
  }
}
