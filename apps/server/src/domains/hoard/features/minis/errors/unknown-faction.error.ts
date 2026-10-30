/** A faction the minis should get is neither a catalog faction, a whole game system nor one of the user's own. */
export class UnknownFactionError extends Error {
  constructor() {
    super('Not every faction is in the catalog.');
    this.name = 'UnknownFactionError';
  }
}
