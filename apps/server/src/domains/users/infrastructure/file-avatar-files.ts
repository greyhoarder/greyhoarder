import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Injectable } from '@nestjs/common';
import { AppConfig } from '../../../config/app-config.js';
import { AvatarFiles } from '../ports/avatar-files.js';

/** One file per picture in the avatars directory; its name comes from the server, never from a request. */
@Injectable()
export class FileAvatarFiles extends AvatarFiles {
  constructor(private readonly config: AppConfig) {
    super();
  }

  async save(avatarId: string, image: Buffer): Promise<void> {
    await mkdir(this.config.avatarsDirectory, { recursive: true });
    await writeFile(this.pathOf(avatarId), image);
  }

  async read(avatarId: string): Promise<Buffer | undefined> {
    try {
      return await readFile(this.pathOf(avatarId));
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return undefined;
      }

      throw error;
    }
  }

  async remove(avatarId: string): Promise<void> {
    await rm(this.pathOf(avatarId), { force: true });
  }

  private pathOf(avatarId: string): string {
    return join(this.config.avatarsDirectory, `${avatarId}.jpg`);
  }
}
