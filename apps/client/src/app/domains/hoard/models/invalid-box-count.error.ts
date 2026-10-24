/** Fewer than one or a fractional number of boxes was chosen. */
export class InvalidBoxCountError extends Error {
  constructor(readonly boxes: number) {
    super(`Can't add ${boxes} boxes.`);
    this.name = 'InvalidBoxCountError';
  }
}
