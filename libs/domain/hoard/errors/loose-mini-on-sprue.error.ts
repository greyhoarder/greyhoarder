/** A mini on the sprue without a box: minis on the sprue always belong to a box (docs/domains/hoard.md, Minis). */
export class LooseMiniOnSprueError extends Error {
  constructor() {
    super('A mini on the sprue belongs to a box.');
    this.name = 'LooseMiniOnSprueError';
  }
}
