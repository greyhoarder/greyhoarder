import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { Mini } from '@greyhoarder/domain/hoard';
import { HttpBoxesAdapter } from '../infrastructure/http-boxes-adapter';
import { HttpMinisAdapter } from '../infrastructure/http-minis-adapter';
import { MinisDeletion } from './minis-deletion';
import { MinisStore } from '../data/minis-store';

const mini = (id: string, name: string): Mini => ({
  id,
  name,
  factionIds: [],
  status: 'built',
  parts: [],
  boxId: 'boyz',
  isOnWorkbench: false,
});

const MINIS = [mini('boy-1', 'Boy'), mini('nob', 'Nob'), mini('boy-2', 'Boy')];

describe('Minis deletion', () => {
  /** The deletion of a hoard holding `MINIS`, whose server answers deleting as `remove` does. */
  async function deletionWith(remove: HttpMinisAdapter['delete']) {
    TestBed.configureTestingModule({
      providers: [
        MinisDeletion,
        {
          provide: HttpMinisAdapter,
          useValue: {
            list: vi.fn(async () => ({
              minis: MINIS,
              factionNames: new Map(),
              systemNames: new Map(),
            })),
            delete: vi.fn(remove),
          },
        },
        {
          provide: HttpBoxesAdapter,
          useValue: { list: vi.fn(async () => ({ boxes: [], factionNames: new Map() })) },
        },
      ],
    });
    const store = TestBed.inject(MinisStore);
    store.minis();
    await TestBed.inject(ApplicationRef).whenStable();
    return { deletion: TestBed.inject(MinisDeletion), store };
  }

  const ids = (store: MinisStore): string[] => store.minis().map(({ id }) => id);

  it('names the minis with how many have each name', async () => {
    const { deletion } = await deletionWith(vi.fn());

    deletion.ask(new Set(['boy-1', 'nob', 'boy-2']));

    expect(deletion.names()).toBe('Boy ×2, Nob');
  });

  it('takes the deleted minis out of the hoard', async () => {
    const { deletion, store } = await deletionWith(async () => ({ emptiedBoxIds: [], minis: [] }));
    deletion.ask(new Set(['boy-1', 'nob']));

    await deletion.confirm();

    expect(ids(store)).toEqual(['boy-2']);
  });

  it('keeps every mini when the server does not answer', async () => {
    const { deletion, store } = await deletionWith(() => Promise.reject(new Error('offline')));
    deletion.ask(new Set(['boy-1']));

    const { isDeleted } = await deletion.confirm();

    expect(isDeleted).toBe(false);
    expect(deletion.hasFailed()).toBe(true);
    expect(ids(store)).toEqual(['boy-1', 'nob', 'boy-2']);
  });

  it('tells which boxes have no minis left', async () => {
    const { deletion } = await deletionWith(async () => ({ emptiedBoxIds: ['boyz'], minis: [] }));
    deletion.ask(new Set(['boy-1', 'nob', 'boy-2']));

    const { emptiedBoxIds } = await deletion.confirm();

    expect(emptiedBoxIds).toEqual(['boyz']);
  });
});
