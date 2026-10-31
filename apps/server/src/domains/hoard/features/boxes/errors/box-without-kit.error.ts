/** The box records no kit, so it has no rows to count its minis on the sprue by. */
export class BoxWithoutKitError extends Error {
  constructor() {
    super('This box has no kit to count its minis on the sprue by.');
    this.name = 'BoxWithoutKitError';
  }
}
