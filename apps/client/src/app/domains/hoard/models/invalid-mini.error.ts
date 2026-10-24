/** A mini without a name. */
export class InvalidMiniError extends Error {
  constructor() {
    super('A mini needs a name.');
    this.name = 'InvalidMiniError';
  }
}
