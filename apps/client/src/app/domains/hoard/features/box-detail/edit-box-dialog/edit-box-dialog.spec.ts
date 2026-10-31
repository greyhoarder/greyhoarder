import { TestBed } from '@angular/core/testing';
import type { Box, HobbyStatus, Kit, Mini } from '@greyhoarder/domain/hoard';
import { EditBoxDialog } from './edit-box-dialog';

const ORKS = 'warhammer-40000/orks';

const BOYZ_KIT: Kit = {
  id: 'games-workshop/orks/boyz-2026',
  version: 1,
  name: 'Boyz',
  names: ['Boyz'],
  manufacturer: 'games-workshop',
  factionIds: [ORKS],
  year: 2026,
  isDraft: false,
  variants: [
    {
      name: 'Boyz',
      slots: [
        { count: 9, names: ['Boy'], parts: [], factionIds: [] },
        { count: 1, names: ['Nob'], parts: ['Power Klaw'], factionIds: [] },
      ],
      minis: 10,
    },
  ],
  minis: 10,
  contains: [],
};

const BOYZ: Box = {
  id: 'b1',
  name: 'Boyz (2026)',
  kit: { id: BOYZ_KIT.id, version: 1, name: 'Boyz (2026)' },
  factionIds: [ORKS],
  tags: [],
  addedOn: '2026-10-12',
  number: 1,
};

const mini = (id: string, name: string, status: HobbyStatus): Mini => ({
  id,
  name,
  factionIds: [ORKS],
  status,
  parts: [],
  sprueName: name,
  boxId: BOYZ.id,
  isOnWorkbench: false,
});

/** 5 Boyz and a Nob on the sprue, 2 Boyz built. */
const MINIS: Mini[] = [
  ...['m1', 'm2', 'm3', 'm4', 'm5'].map((id) => mini(id, 'Boy', 'sprue')),
  mini('m6', 'Nob', 'sprue'),
  mini('m7', 'Boy', 'built'),
  mini('m8', 'Boy', 'built'),
];

describe('Edit box dialog', () => {
  const render = async () => {
    const fixture = TestBed.createComponent(EditBoxDialog);
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('box', BOYZ);
    fixture.componentRef.setInput('kit', BOYZ_KIT);
    fixture.componentRef.setInput('minis', MINIS);
    await fixture.whenStable();
    const saved = vi.fn();
    const closed = vi.fn();
    fixture.componentInstance.saved.subscribe(saved);
    fixture.componentInstance.closed.subscribe(closed);
    // The dialog opens in an overlay outside the component.
    const all = (testId: string): HTMLElement[] => [
      ...document.querySelectorAll<HTMLElement>(`[data-testid="${testId}"]`),
    ];
    const find = (testId: string): HTMLElement | undefined => all(testId)[0];
    const counts = (): string[] => all('box-edit-count').map((count) => count.textContent?.trim() ?? '');
    const click = async (element: HTMLElement | undefined): Promise<void> => {
      element?.click();
      await fixture.whenStable();
    };
    return { fixture, saved, closed, all, find, counts, click };
  };

  afterEach(() => TestBed.resetTestingModule());

  it('starts each row at the minis on the sprue of that row', async () => {
    const { counts } = await render();

    expect(counts()).toEqual(['5', '1']);
  });

  it('says how many minis on the sprue will be deleted for good while rows are lowered', async () => {
    const { all, find, click } = await render();
    const before = find('box-edit-delete-note');

    await click(all('box-edit-less')[0]);
    await click(all('box-edit-less')[0]);

    expect(before).toBeUndefined();
    expect(find('box-edit-delete-note')?.textContent?.trim()).toBe('2 minis on the sprue will be deleted for good.');
  });

  it('hands over the counted rows with "Save"', async () => {
    const { all, find, click, saved } = await render();
    await click(all('box-edit-more')[1]);

    await click(find('box-edit-save'));

    expect(saved).toHaveBeenCalledExactlyOnceWith([5, 2]);
  });

  it('closes without saving when cancelled', async () => {
    const { all, find, click, saved, closed } = await render();
    await click(all('box-edit-more')[1]);

    await click(find('box-edit-cancel'));

    expect(closed).toHaveBeenCalledOnce();
    expect(saved).not.toHaveBeenCalled();
  });

  it('only closes when saved without a change', async () => {
    const { find, click, saved, closed } = await render();

    await click(find('box-edit-save'));

    expect(closed).toHaveBeenCalledOnce();
    expect(saved).not.toHaveBeenCalled();
  });

  it("says that it can't be saved when the server does not answer, keeping the counted rows", async () => {
    const { fixture, all, find, click, counts } = await render();
    await click(all('box-edit-less')[0]);
    await click(find('box-edit-save'));

    fixture.componentRef.setInput('hasFailed', true);
    await fixture.whenStable();

    expect(find('box-edit-error')?.textContent?.trim()).toBe("Can't save right now. Try again in a moment.");
    expect(counts()).toEqual(['4', '1']);
  });

  it('starts with the focus on the first row', async () => {
    const { find } = await render();

    expect(find('box-edit-row')?.contains(document.activeElement)).toBe(true);
  });
});
