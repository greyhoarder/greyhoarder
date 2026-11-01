/** The picture files of the users, one per `avatarId`. */
export abstract class AvatarFiles {
  abstract save(avatarId: string, image: Buffer): Promise<void>;

  /** `undefined` when there is no such file. */
  abstract read(avatarId: string): Promise<Buffer | undefined>;

  /** Removing a file that is not there does nothing. */
  abstract remove(avatarId: string): Promise<void>;
}
