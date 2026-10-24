import type { BoxProgress } from '../models/box-progress';

export const PROGRESS_LABELS: Readonly<Record<BoxProgress, string>> = {
  untouched: 'Untouched',
  started: 'Started',
  done: 'Done',
};

/** E.g. "Boyz (2026) · 50-80"; "No kit" for boxes without one. */
export function kitLine(box: { readonly kit?: { readonly name: string; readonly sku?: string } }): string {
  if (!box.kit) {
    return 'No kit';
  }
  const { name, sku } = box.kit;
  return sku ? `${name} · ${sku}` : name;
}
