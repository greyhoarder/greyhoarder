import { UserDeleting } from '../../../../../shared/events/user-deleting.event.js';
import type { HoardRepository } from '../../../ports/hoard-repository.js';
import { UserDeletingListener } from './user-deleting.listener.js';
import { partialFake } from '../../../../../shared/testing/partial-fake.js';

describe('Hoards of deleted users', () => {
  it('deletes the hoard of a deleted user only', async () => {
    const deleteHoard = vi.fn(async () => undefined);
    const listener = new UserDeletingListener(partialFake<HoardRepository>({ deleteHoard }));

    await listener.handle(new UserDeleting('ben'));

    expect(deleteHoard).toHaveBeenCalledExactlyOnceWith('ben');
  });
});
