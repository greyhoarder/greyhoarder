import { addAccountRequestSchema } from '@greyhoarder/protocol/auth';
import type { User } from '@greyhoarder/domain/users';
import { type AccountsService, type UserQueries, UsernameTakenError } from '../../../users/api/index.js';
import type { PasswordHasher } from '../../ports/password-hasher.js';
import type { SessionRegistry } from '../../ports/session-registry.js';
import { AccountsManagementService } from './accounts-management.service.js';

const MIRA: User = { id: '1', username: 'mira', role: 'admin', disabled: false };
const BEN: User = { id: '2', username: 'ben', role: 'member', disabled: false };

function serviceWith(create = vi.fn(async () => undefined)) {
  const queries = { findAll: vi.fn(async () => [MIRA, BEN]), findById: vi.fn(async () => BEN) };
  const accounts = { create };
  const passwords = { hash: vi.fn(async (password: string) => `hash of ${password}`) };
  return new AccountsManagementService(
    queries as unknown as UserQueries,
    accounts as unknown as AccountsService,
    passwords as unknown as PasswordHasher,
    { removeAll: vi.fn(async () => undefined) } as unknown as SessionRegistry,
  );
}

describe('Accounts of the instance', () => {
  it('lists every account with its role', async () => {
    const service = serviceWith();

    const users = await service.list();

    expect(users.map(({ username, role }) => [username, role])).toEqual([
      ['mira', 'admin'],
      ['ben', 'member'],
    ]);
  });

  it('adds an account with a hashed password', async () => {
    const create = vi.fn(async () => undefined);
    const service = serviceWith(create);

    await service.add('ben', 'member', 'first password');

    expect(create).toHaveBeenCalledWith('ben', 'member', 'hash of first password');
  });

  it('refuses a username already taken', async () => {
    const service = serviceWith(vi.fn(() => Promise.reject(new UsernameTakenError())));

    const add = service.add('ben', 'member', 'first password');

    await expect(add).rejects.toThrow(UsernameTakenError);
  });

  it('sets a new password and ends all sessions', async () => {
    const changePasswordHash = vi.fn(async () => undefined);
    const removeAll = vi.fn(async () => undefined);
    const service = new AccountsManagementService(
      { findById: vi.fn(async () => BEN) } as unknown as UserQueries,
      { changePasswordHash } as unknown as AccountsService,
      { hash: vi.fn(async (password: string) => `hash of ${password}`) } as unknown as PasswordHasher,
      { removeAll } as unknown as SessionRegistry,
    );

    await service.setPassword(BEN.id, 'new password');

    expect(changePasswordHash).toHaveBeenCalledWith(BEN.id, 'hash of new password');
    expect(removeAll).toHaveBeenCalledWith(BEN.id);
  });

  it('refuses an empty password', () => {
    const request = addAccountRequestSchema.safeParse({ username: 'ben', role: 'member', password: '' });

    expect(request.success).toBe(false);
  });
});
