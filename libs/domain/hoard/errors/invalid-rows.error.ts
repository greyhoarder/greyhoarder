/** Rows that do not fit the kit: one count of none or more for each row it puts on the sprue. */
export class InvalidRowsError extends Error {
  constructor() {
    super("The rows don't fit the kit.");
    this.name = 'InvalidRowsError';
  }
}
