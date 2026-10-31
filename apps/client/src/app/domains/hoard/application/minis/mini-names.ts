import type { Mini } from '@greyhoarder/domain/hoard';
import { eitherOrText } from '../../util/either-or';

/** Each name once with how many minis have it, in the order they come, e.g. "Boy ×2, Nob". */
export function namesOf(minis: readonly Mini[]): string {
  const counts = new Map<string, number>();
  for (const { name } of minis) {
    const text = eitherOrText(name);
    counts.set(text, (counts.get(text) ?? 0) + 1);
  }
  return [...counts].map(([name, count]) => (count > 1 ? `${name} ×${count}` : name)).join(', ');
}
