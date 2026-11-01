import type { User } from '@greyhoarder/domain/users';

/** Where a user's picture is; none without one. A new picture has a new address, so browsers may keep the old. */
export function avatarUrl({ id, avatarId }: Pick<User, 'id' | 'avatarId'>): string | undefined {
  return avatarId === undefined ? undefined : `/api/users/${encodeURIComponent(id)}/avatar?v=${avatarId}`;
}
