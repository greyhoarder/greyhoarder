import type { Mini } from './mini.js';
import { stepChange } from './mini-steps.js';

const mini = (status: Mini['status']): Mini => ({
  id: 'boy',
  name: 'Boy',
  factionIds: [],
  status,
  parts: [],
  isOnWorkbench: false,
});

describe('Steps of minis', () => {
  it('records the status a mini reached, not the ones it skipped', () => {
    const change = stepChange([mini('built')], [mini('painted')], '2026-11-02');

    expect(change).toEqual({ reached: [{ miniId: 'boy', status: 'painted', on: '2026-11-02' }], undone: [] });
  });

  it('removes the steps past the status a mini goes back to', () => {
    const change = stepChange([mini('done')], [mini('primed')], '2026-11-02');

    expect(change).toEqual({ reached: [], undone: [{ miniId: 'boy', statuses: ['painted', 'done'] }] });
  });

  it('records no step when the status stays', () => {
    const change = stepChange([mini('primed')], [mini('primed')], '2026-11-02');

    expect(change).toEqual({ reached: [], undone: [] });
  });
});
