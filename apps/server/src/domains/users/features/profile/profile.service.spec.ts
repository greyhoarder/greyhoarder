import { updateProfileRequestSchema } from '@greyhoarder/protocol/auth';
import { AVATAR_MAX_BYTES, type User } from '@greyhoarder/domain/users';
import type { AvatarFiles } from '../../ports/avatar-files.js';
import type { UserQueries } from '../../ports/user-queries.js';
import type { UserRepository } from '../../ports/user-repository.js';
import { InvalidAvatarError } from './errors/invalid-avatar.error.js';
import { ProfileService } from './profile.service.js';

const MIRA: User = { id: 'a'.repeat(24), username: 'mira', role: 'admin', disabled: false };
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]);

function serviceWith() {
  const repository = { updateProfile: vi.fn(async () => MIRA) };
  const queries = { findById: vi.fn(async () => MIRA) };
  const files = {
    save: vi.fn(async () => undefined),
    read: vi.fn(async () => undefined),
    remove: vi.fn(async () => undefined),
  };
  const service = new ProfileService(
    repository as unknown as UserRepository,
    queries as unknown as UserQueries,
    files as unknown as AvatarFiles,
  );
  return { service, repository, files };
}

describe('Profiles', () => {
  it('stores a display name', async () => {
    const { service, repository } = serviceWith();

    await service.update(MIRA.id, { displayName: 'Mira K.' });

    expect(repository.updateProfile).toHaveBeenCalledWith(MIRA.id, { displayName: 'Mira K.' });
  });

  it('removes an empty display name', async () => {
    const { service, repository } = serviceWith();

    await service.update(MIRA.id, { displayName: '' });

    expect(repository.updateProfile).toHaveBeenCalledWith(MIRA.id, { displayName: undefined });
  });

  it('refuses a display name over 50 characters', () => {
    const request = updateProfileRequestSchema.safeParse({ displayName: 'x'.repeat(51) });

    expect(request.success).toBe(false);
  });

  it('stores the language', async () => {
    const { service, repository } = serviceWith();

    await service.update(MIRA.id, { language: 'de' });

    expect(repository.updateProfile).toHaveBeenCalledWith(MIRA.id, { language: 'de' });
  });

  it('stores a picture and replaces the old one', async () => {
    const { service, repository, files } = serviceWith();

    await service.setAvatar({ ...MIRA, avatarId: 'old' }, JPEG);

    const [[newId]] = files.save.mock.calls as unknown as [[string]];
    expect(newId).not.toBe('old');
    expect(repository.updateProfile).toHaveBeenCalledWith(MIRA.id, { avatarId: newId });
    expect(files.remove).toHaveBeenCalledWith('old');
  });

  it('removes the picture and its file', async () => {
    const { service, repository, files } = serviceWith();

    await service.removeAvatar({ ...MIRA, avatarId: 'old' });

    expect(repository.updateProfile).toHaveBeenCalledWith(MIRA.id, { avatarId: undefined });
    expect(files.remove).toHaveBeenCalledWith('old');
  });

  it('refuses a file over the limit or of another type', async () => {
    const { service, files } = serviceWith();

    const tooLarge = service.setAvatar(MIRA, Buffer.concat([JPEG, Buffer.alloc(AVATAR_MAX_BYTES)]));
    const otherType = service.setAvatar(MIRA, Buffer.from('<svg></svg>'));

    await expect(tooLarge).rejects.toThrow(InvalidAvatarError);
    await expect(otherType).rejects.toThrow(InvalidAvatarError);
    expect(files.save).not.toHaveBeenCalled();
  });
});
