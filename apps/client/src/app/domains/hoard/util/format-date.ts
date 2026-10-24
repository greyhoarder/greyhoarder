/** Dates follow the English interface, e.g. "12 Oct 2026" (three-letter months, also "Sep"). */
export function formatDate(isoDate: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).formatToParts(new Date(isoDate));
  const part = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((candidate) => candidate.type === type)?.value ?? '';
  return `${part('day')} ${part('month')} ${part('year')}`;
}
