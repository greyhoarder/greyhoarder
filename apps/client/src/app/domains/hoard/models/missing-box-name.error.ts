/** The boxes to add were given an empty name. */
export class MissingBoxNameError extends Error {
  constructor() {
    super("Can't add boxes without a name.");
    this.name = 'MissingBoxNameError';
  }
}
