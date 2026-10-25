/** Names of either-or kits, and of their boxes and minis, join the outcomes with it (`kitName`). */
const SEPARATOR = ' / ';

/** The outcomes a name joins, e.g. "Lootas" and "Burna Boyz (2008)"; other names are one. */
export function eitherOrParts(name: string): string[] {
  return name.split(SEPARATOR);
}

/** For plain text, such as the browser tab: "Lootas or Burna Boyz". */
export function eitherOrText(name: string): string {
  return eitherOrParts(name).join(' or ');
}
