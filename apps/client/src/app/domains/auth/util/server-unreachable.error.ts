/** The request never got an answer from the server, e.g. because it is down. */
export class ServerUnreachableError extends Error {
  constructor() {
    super('The server could not be reached.');
    this.name = 'ServerUnreachableError';
  }
}
