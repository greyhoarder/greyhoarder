import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { AVATAR_MAX_BYTES, type Language, type User } from '@greyhoarder/domain/users';
import { AvatarFiles } from '../../ports/avatar-files.js';
import { UserQueries } from '../../ports/user-queries.js';
import { type ProfileChanges, UserRepository } from '../../ports/user-repository.js';
import { InvalidAvatarError } from './errors/invalid-avatar.error.js';

/** The start of every JPEG file. */
const JPEG_START = Buffer.from([0xff, 0xd8, 0xff]);

/** A signed-in user's display name, language and picture (docs/use-cases/edit-your-profile.md). */
@Injectable()
export class ProfileService {
  constructor(
    private readonly users: UserRepository,
    private readonly queries: UserQueries,
    private readonly files: AvatarFiles,
  ) {}

  /** An empty display name removes it. */
  update(userId: string, changes: { readonly displayName?: string; readonly language?: Language }): Promise<User> {
    const { displayName, language } = changes;
    const profile: ProfileChanges = {
      ...(displayName === undefined ? {} : { displayName: displayName === '' ? undefined : displayName }),
      ...(language === undefined ? {} : { language }),
    };
    return this.users.updateProfile(userId, profile);
  }

  /**
   * Stores the picture under a new id and deletes the old one.
   *
   * @throws InvalidAvatarError when the file is no JPEG or too large
   */
  async setAvatar(user: User, image: Buffer): Promise<User> {
    if (image.length > AVATAR_MAX_BYTES || !image.subarray(0, JPEG_START.length).equals(JPEG_START)) {
      throw new InvalidAvatarError();
    }
    const avatarId = randomUUID();
    await this.files.save(avatarId, image);
    const updated = await this.users.updateProfile(user.id, { avatarId });
    await this.removeFile(user);
    return updated;
  }

  async removeAvatar(user: User): Promise<User> {
    const updated = await this.users.updateProfile(user.id, { avatarId: undefined });
    await this.removeFile(user);
    return updated;
  }

  /** The user's picture; `undefined` without one, or for an id that is no user's. */
  async avatarOf(userId: string): Promise<Buffer | undefined> {
    const user = await this.queries.findById(userId);
    return user?.avatarId === undefined ? undefined : this.files.read(user.avatarId);
  }

  private async removeFile({ avatarId }: User): Promise<void> {
    if (avatarId !== undefined) {
      await this.files.remove(avatarId);
    }
  }
}
