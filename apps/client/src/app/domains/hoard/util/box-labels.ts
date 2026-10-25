import type { Box } from '@greyhoarder/domain/hoard';
import type { BoxProgress } from '../models/box-progress';
import { eitherOrText } from './either-or';
import { formatDate } from './format-date';

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
  return sku ? `${eitherOrText(name)} · ${sku}` : eitherOrText(name);
}

/**
 * What tells each box apart in a list of boxes, by id: its name, followed by the day it was
 * added when another box has the same name, e.g. "Boyz (2026) · 12 Oct 2026".
 */
export function distinctBoxNames(boxes: readonly Box[]): Map<string, string> {
  const namesake = (box: Box) => boxes.some((other) => other.id !== box.id && other.name === box.name);
  return new Map(
    boxes.map((box) => {
      const name = eitherOrText(box.name);
      return [box.id, namesake(box) ? `${name} · ${formatDate(box.addedOn)}` : name];
    }),
  );
}
