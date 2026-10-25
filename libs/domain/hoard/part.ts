/** A part of the user's vocabulary, e.g. "Power Klaw" (docs/domains/hoard.md, Parts). */
export interface Part {
  readonly id: string;
  readonly name: string;
  /** Older names and other spellings, for search and input. */
  readonly aliases: readonly string[];
}

/** The part whose name or one of whose aliases is the text, ignoring case and surrounding spaces. */
export function findPart(parts: readonly Part[], text: string): Part | undefined {
  const key = partKey(text);
  return parts.find((part) => [part.name, ...part.aliases].some((name) => partKey(name) === key));
}

/** What tells parts apart: their name ignoring case and surrounding spaces. */
export function partKey(text: string): string {
  return text.trim().toLowerCase();
}
