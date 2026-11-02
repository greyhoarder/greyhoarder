import { computed, Injectable, signal } from '@angular/core';

/** Minis changed together, and where they were selected: on a box, or else in the hoard. */
export interface MinisChange {
  readonly count: number;
  readonly boxId?: string;
}

/**
 * Says where minis were selected how many of them were changed together, once the user is back
 * there, until dismissed or left (docs/screens/hoard.md, docs/screens/box.md).
 */
@Injectable({ providedIn: 'root' })
export class MinisChangedNotice {
  private readonly latest = signal<MinisChange | undefined>(undefined);

  /** How many minis selected in the hoard were changed; none to tell. */
  readonly hoardCount = computed(() => {
    const change = this.latest();

    return change?.boxId === undefined ? change?.count : undefined;
  });

  /** How many minis selected on the box were changed; none to tell. */
  countFor(boxId: string): number | undefined {
    const change = this.latest();

    return change?.boxId === boxId ? change.count : undefined;
  }

  tell(change: MinisChange): void {
    this.latest.set(change);
  }

  dismiss(): void {
    this.latest.set(undefined);
  }
}

/** E.g. "Changed 5 minis."; one: "Changed 1 mini." */
export function changedText(count: number): string {
  return `Changed ${count} ${count === 1 ? 'mini' : 'minis'}.`;
}
