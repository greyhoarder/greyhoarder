import { hasReached, hobbyStatuses } from './hobby-status';

describe('Hobby status', () => {
  it('lists the statuses in the order of the hobby pipeline', () => {
    const order = hobbyStatuses;

    expect(order).toEqual(['sprue', 'built', 'primed', 'painted', 'done']);
  });

  it('counts a mini as having reached a status once it is at that status or a later one', () => {
    const pairs = hobbyStatuses.flatMap((status, statusIndex) =>
      hobbyStatuses.map((step, stepIndex) => ({ status, step, isReached: statusIndex >= stepIndex })),
    );

    const results = pairs.map(({ status, step }) => hasReached(status, step));

    expect(results).toEqual(pairs.map(({ isReached }) => isReached));
  });
});
