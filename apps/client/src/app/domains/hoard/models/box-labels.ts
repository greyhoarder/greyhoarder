import type { BoxProgress } from './box-progress';
import type { BoxRow } from './box-row';

export const PROGRESS_LABELS: Readonly<Record<BoxProgress, string>> = {
  untouched: 'Untouched',
  started: 'Started',
  done: 'Done',
};

/** E.g. "Boyz (2026) · 50-80"; "No kit" for boxes without one. */
export function kitLine(box: BoxRow): string {
  if (!box.kit) {
    return 'No kit';
  }
  const { name, sku } = box.kit;
  return sku ? `${name} · ${sku}` : name;
}
