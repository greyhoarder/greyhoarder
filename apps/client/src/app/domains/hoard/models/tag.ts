/** Tags without surrounding spaces, empty ones and repeats, in the order they were given. */
export function parseTags(tags: readonly string[]): string[] {
  return [...new Set(tags.map((tag) => tag.trim()).filter((tag) => tag !== ''))];
}
