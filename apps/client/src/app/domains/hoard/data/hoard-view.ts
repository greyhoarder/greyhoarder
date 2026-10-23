import { Injectable, signal } from '@angular/core';

export type HoardViewMode = 'cards' | 'table';

/** Cards or table, shared by the Minis and Boxes tabs. */
@Injectable({ providedIn: 'root' })
export class HoardView {
  readonly mode = signal<HoardViewMode>('cards');
}
