import type { User } from '@greyhoarder/domain/users';
import type { DomainEvents } from '../../../../shared/events/domain-events.js';
import { UserDeleting } from '../../../../shared/events/user-deleting.event.js';
import type { AvatarFiles } from '../../ports/avatar-files.js';
import type { UserQueries } from '../../ports/user-queries.js';
import type { UserRepository } from '../../ports/user-repository.js';
import { LastAdministratorError } from './errors/last-administrator.error.js';
import { UserManagementService } from './user-management.service.js';

const MIRA: User = { id: 'mira', username: 'mira', role: 'admin', disabled: false };
const BEN: User = { id: 'ben', username: 'ben', role: 'member', disabled: false, avatarId: 'picture' };

function serviceWith({ dispatch = vi.fn(async () => undefined) } = {}) {
  const users = {
    updateAccount: vi.fn(async (id: string, changes: Partial<User>) => ({ ...BEN, id, ...changes })),
    remove: vi.fn(async () => undefined),
  };
  const queries = { findAll: vi.fn(async () => [MIRA, BEN]) };
  const files = { remove: vi.fn(async () => undefined) };
  const service = new UserManagementService(
    users as unknown as UserRepository,
    queries as unknown as UserQueries,
    files as unknown as AvatarFiles,
    { dispatch } as unknown as DomainEvents,
  );
  return { service, users, files, dispatch };
}

describe('Managing accounts', () => {
  it('changes the role of an account', async () => {
    const { service, users } = serviceWith();

    await service.change(BEN.id, { role: 'admin' });

    expect(users.updateAccount).toHaveBeenCalledWith(BEN.id, { role: 'admin' });
  });

  it('disables and enables an account', async () => {
    const { service, users } = serviceWith();

    await service.change(BEN.id, { disabled: true });
    await service.change(BEN.id, { disabled: false });

    expect(users.updateAccount).toHaveBeenCalledWith(BEN.id, { disabled: true });
    expect(users.updateAccount).toHaveBeenCalledWith(BEN.id, { disabled: false });
  });

  it('deletes an account after the hoard goes', async () => {
    const { service, users, files, dispatch } = serviceWith();

    await service.remove(BEN.id);

    expect(users.updateAccount).toHaveBeenCalledWith(BEN.id, { disabled: true });
    expect(dispatch).toHaveBeenCalledWith(new UserDeleting(BEN.id));
    expect(users.remove).toHaveBeenCalledWith(BEN.id);
    expect(dispatch.mock.invocationCallOrder[0]).toBeLessThan(users.remove.mock.invocationCallOrder[0] ?? 0);
    expect(files.remove).toHaveBeenCalledWith('picture');
  });

  it('keeps the account when deleting the hoard fails', async () => {
    const { service, users } = serviceWith({ dispatch: vi.fn(() => Promise.reject(new Error('no database'))) });

    const remove = service.remove(BEN.id);

    await expect(remove).rejects.toThrow('no database');
    expect(users.remove).not.toHaveBeenCalled();
    expect(users.updateAccount).toHaveBeenLastCalledWith(BEN.id, { disabled: false });
  });

  it('finishes deleting an account when asked again after stopping halfway', async () => {
    const { service, users, dispatch } = serviceWith();
    users.remove.mockRejectedValueOnce(new Error('no database'));
    const firstAttempt = service.remove(BEN.id);
    await expect(firstAttempt).rejects.toThrow('no database');

    await service.remove(BEN.id);

    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(users.remove).toHaveBeenCalledTimes(2);
  });

  it('refuses to demote the last active administrator', async () => {
    const { service, users } = serviceWith();

    const change = service.change(MIRA.id, { role: 'member' });

    await expect(change).rejects.toThrow(LastAdministratorError);
    expect(users.updateAccount).not.toHaveBeenCalled();
  });

  it('refuses to disable the last active administrator', async () => {
    const { service, users } = serviceWith();

    const change = service.change(MIRA.id, { disabled: true });

    await expect(change).rejects.toThrow(LastAdministratorError);
    expect(users.updateAccount).not.toHaveBeenCalled();
  });

  it('refuses to delete the last active administrator', async () => {
    const { service, users } = serviceWith();

    const remove = service.remove(MIRA.id);

    await expect(remove).rejects.toThrow(LastAdministratorError);
    expect(users.remove).not.toHaveBeenCalled();
  });
});
