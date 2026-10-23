/** The catalog's files don't match the format this release knows (ADR-0020). */
export class CatalogFormatError extends Error {
  constructor(problems: readonly string[]) {
    super(`The catalog does not match the format this release knows:\n${problems.join('\n')}`);
    this.name = 'CatalogFormatError';
  }
}
