import { EventEmitter2 } from '@nestjs/event-emitter';
import { DomainEvents } from './domain-events.js';

class SomethingHappening {}

describe('Domain events', () => {
  it('waits for every listener and fails with them', async () => {
    const emitter = new EventEmitter2();
    const heard = vi.fn();
    emitter.on(SomethingHappening.name, async () => {
      await Promise.resolve();
      heard();
    });
    emitter.on(SomethingHappening.name, () => Promise.reject(new Error('listener failed')));

    const dispatch = new DomainEvents(emitter).dispatch(new SomethingHappening());

    await expect(dispatch).rejects.toThrow('listener failed');
    expect(heard).toHaveBeenCalledOnce();
  });
});
