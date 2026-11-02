import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { Box, Mini } from '@greyhoarder/domain/hoard';
import { HttpBoxesAdapter } from '../../infrastructure/http-boxes-adapter';
import { HttpMinisAdapter } from '../../infrastructure/http-minis-adapter';
import { BoxesDeletion } from './boxes-deletion';
import { BoxesStore } from '../../data/boxes-store';
import { MinisStore } from '../../data/minis-store';

const box = (id: string): Box => ({
  id,
  name: id,
  factionIds: [],
  tags: [],
  addedOn: '2026-10-25',
  number: 1,
});

const mini = (id: string, boxId: string, overrides: Partial<Mini> = {}): Mini => ({
  id,
  name: 'Boy',
  factionIds: [],
  status: 'built',
  parts: [],
  boxId,
  isOnWorkbench: false,
  ...overrides,
});

const BOXES = [box('boyz'), box('nobz')];

const MINIS = [
  mini('boy-1', 'boyz'),
  mini('boy-2', 'boyz'),
  mini('sold-boy', 'boyz', { departure: { reason: 'sold', on: '2026-10-20' } }),
  mini('nob', 'nobz'),
];

describe('Boxes deletion', () => {
  /** The deletion of a hoard holding `BOXES` and these minis, whose server answers deleting as `remove` does. */
  async function deletionWith(remove: HttpBoxesAdapter['delete'], hoardMinis: readonly Mini[] = MINIS) {
    TestBed.configureTestingModule({
      providers: [
        BoxesDeletion,
        {
          provide: HttpMinisAdapter,
          useValue: {
            list: vi.fn(async () => ({
              minis: hoardMinis,
              factionNames: new Map(),
              systemNames: new Map(),
            })),
          },
        },
        {
          provide: HttpBoxesAdapter,
          useValue: {
            list: vi.fn(async () => ({ boxes: BOXES, factionNames: new Map() })),
            delete: vi.fn(remove),
          },
        },
      ],
    });
    const minis = TestBed.inject(MinisStore);
    const boxes = TestBed.inject(BoxesStore);
    minis.minis();
    boxes.boxes();
    await TestBed.inject(ApplicationRef).whenStable();

    return { deletion: TestBed.inject(BoxesDeletion), minis, boxes };
  }

  const idsOf = (items: readonly { readonly id: string }[]): string[] => items.map(({ id }) => id);

  it('takes the box and all its minis out of the hoard', async () => {
    const { deletion, minis, boxes } = await deletionWith(async () => ({
      deletedMiniIds: ['boy-1', 'boy-2', 'sold-boy'],
      minis: [],
    }));

    deletion.ask(['boyz']);

    await deletion.confirm();

    expect(idsOf(boxes.boxes())).toEqual(['nobz']);
    expect(idsOf(minis.minis())).toEqual(['nob']);
  });

  it('keeps the box and its minis when the server does not answer', async () => {
    const { deletion, minis, boxes } = await deletionWith(() => Promise.reject(new Error('offline')));
    deletion.ask(['boyz']);

    const isDeleted = await deletion.confirm();

    expect(isDeleted).toBe(false);
    expect(deletion.hasFailed()).toBe(true);
    expect(idsOf(boxes.boxes())).toEqual(['boyz', 'nobz']);
    expect(idsOf(minis.minis())).toEqual(['boy-1', 'boy-2', 'sold-boy', 'nob']);
  });

  it('deletes every box asked about in one request', async () => {
    const remove = vi.fn<HttpBoxesAdapter['delete']>(async () => ({
      deletedMiniIds: ['boy-1', 'boy-2', 'sold-boy', 'nob'],
      minis: [],
    }));

    const { deletion, minis, boxes } = await deletionWith(remove);
    deletion.ask(['boyz', 'nobz']);

    await deletion.confirm();

    expect(remove).toHaveBeenCalledOnce();
    expect(remove).toHaveBeenCalledWith(['boyz', 'nobz']);
    expect(boxes.boxes()).toEqual([]);
    expect(minis.minis()).toEqual([]);
  });

  it('keeps every box and its minis when the server does not answer', async () => {
    const { deletion, minis, boxes } = await deletionWith(() => Promise.reject(new Error('offline')));
    deletion.ask(['boyz', 'nobz']);

    const isDeleted = await deletion.confirm();

    expect(isDeleted).toBe(false);
    expect(deletion.hasFailed()).toBe(true);
    expect(idsOf(boxes.boxes())).toEqual(['boyz', 'nobz']);
    expect(idsOf(minis.minis())).toEqual(['boy-1', 'boy-2', 'sold-boy', 'nob']);
  });

  it('counts the built minis and the minis on the sprue of the box, gone ones included', async () => {
    const { deletion } = await deletionWith(vi.fn(), [
      ...MINIS,
      mini('sprue-boy-1', 'boyz', { status: 'sprue' }),
      mini('sprue-boy-2', 'boyz', { status: 'sprue', departure: { reason: 'lost', on: '2026-10-21' } }),
      mini('sprue-nob', 'nobz', { status: 'sprue' }),
    ]);

    deletion.ask(['boyz']);

    expect([deletion.builtMiniCount(), deletion.sprueMiniCount()]).toEqual([3, 2]);
  });

  it('keeps the built minis of a deleted box in the hoard without a box when asked', async () => {
    const remove = vi.fn<HttpBoxesAdapter['delete']>(async () => ({
      deletedMiniIds: [],
      minis: MINIS.filter((each) => each.boxId === 'boyz').map((each) => ({ ...each, boxId: undefined })),
    }));

    const { deletion, minis, boxes } = await deletionWith(remove);
    deletion.ask(['boyz']);

    await deletion.confirmKeepingBuiltMinis();

    expect(remove).toHaveBeenCalledWith(['boyz'], { keepBuiltMinis: true });
    expect(idsOf(boxes.boxes())).toEqual(['nobz']);
    expect(idsOf(minis.minis().filter((each) => each.boxId === undefined))).toEqual(['boy-1', 'boy-2', 'sold-boy']);
  });
});
