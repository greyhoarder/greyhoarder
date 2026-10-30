/** A copy of the selected ids with one id added or removed. */
export function toggled(ids: ReadonlySet<string>, id: string, isSelected: boolean): ReadonlySet<string> {
  const next = new Set(ids);
  if (isSelected) {
    next.add(id);
  } else {
    next.delete(id);
  }
  return next;
}
