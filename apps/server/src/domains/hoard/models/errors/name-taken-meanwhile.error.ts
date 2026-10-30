/** Another change added a part or own faction of the same name while this one was being stored. */
export class NameTakenMeanwhileError extends Error {
  constructor() {
    super('A name was added by another change meanwhile.');
    this.name = 'NameTakenMeanwhileError';
  }
}
