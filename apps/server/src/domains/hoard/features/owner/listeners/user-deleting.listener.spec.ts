import { UserDeleting } from '../../../../../shared/events/user-deleting.event.js';
import type { HoardRepository } from '../../../ports/hoard-repository.js';
import { UserDeletingListener } from './user-deleting.listener.js';

describe('Hoards of deleted users', () => {
  it('deletes the hoard of a deleted user only', async () => {
    const deleteHoard = vi.fn(async () => undefined);
    const listener = new UserDeletingListener({ deleteHoard } as unknown as HoardRepository);

    await listener.handle(new UserDeleting('ben'));

    expect(deleteHoard).toHaveBeenCalledExactlyOnceWith('ben');
  });
});
