/** The file is no JPEG, or too large. */
export class InvalidAvatarError extends Error {
  constructor() {
    super('This is not a picture that can be used.');
    this.name = 'InvalidAvatarError';
  }
}
