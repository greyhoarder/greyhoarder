/** A faction the minis should get is neither a catalog faction nor a whole game system. */
export class UnknownFactionError extends Error {
  constructor() {
    super('Not every faction is in the catalog.');
    this.name = 'UnknownFactionError';
  }
}
