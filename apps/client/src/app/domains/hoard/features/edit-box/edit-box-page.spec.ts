import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import type { Box, HobbyStatus, Mini } from '@greyhoarder/domain/hoard';
import { HttpKitsAdapter } from '../../../catalog/api';
import { MinisStore } from '../../data/minis-store';
import { HttpBoxesAdapter } from '../../infrastructure/http-boxes-adapter';
import { HttpMinisAdapter } from '../../infrastructure/http-minis-adapter';
import { HttpPartsAdapter } from '../../infrastructure/http-parts-adapter';
import { EditBoxPage } from './edit-box-page';

const ORKS = 'warhammer-40000/orks';

const BOYZ_KIT = {
  id: 'games-workshop/orks/boyz-2026',
  version: 1,
  manufacturer: 'games-workshop',
  name: 'Boyz',
  factionIds: [ORKS],
  releases: [{ year: 2026 }],
  minis: 10,
  isDraft: false,
  contains: [],
  variants: [
    {
      name: 'Boyz',
      slots: [
        { count: 9, buildsAs: ['Boy'], parts: [], factionIds: [] },
        { count: 1, buildsAs: ['Nob'], parts: ['Power Klaw'], factionIds: [] },
      ],
    },
  ],
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

const LOOSE: Box = { id: 'b2', name: 'Bits', factionIds: [ORKS], tags: [], addedOn: '2026-10-01', number: 1 };

const mini = (id: string, name: string, status: HobbyStatus, overrides: Partial<Mini> = {}): Mini => ({
  id,
  name,
  factionIds: [ORKS],
  status,
  parts: [],
  sprueName: name,
  boxId: BOYZ.id,
  isOnWorkbench: false,
  ...overrides,
});

/** 5 Boyz and a Nob on the sprue, 2 Boyz built. */
const MINIS: Mini[] = [
  ...['m1', 'm2', 'm3', 'm4', 'm5'].map((id) => mini(id, 'Boy', 'sprue')),
  mini('m6', 'Nob', 'sprue'),
  mini('m7', 'Boy', 'built'),
  mini('m8', 'Boy', 'built'),
];

@Component({ template: '' })
class Elsewhere {}

describe('Edit box page', () => {
  let fixture: ComponentFixture<EditBoxPage>;
  let editRows = vi.fn<HttpBoxesAdapter['editRows']>();

  async function showPage(id: string, minis: readonly Mini[] = MINIS): Promise<ReturnType<typeof vi.spyOn>> {
    editRows = vi.fn(async () => ({ box: BOYZ, addedMinis: [], deletedMiniIds: [], minis: [] }));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: '**', component: Elsewhere }]),
        {
          provide: HttpBoxesAdapter,
          useValue: {
            list: vi.fn(async () => ({ boxes: [BOYZ, LOOSE], factionNames: new Map() })),
            editRows: vi.fn((...args: Parameters<HttpBoxesAdapter['editRows']>) => editRows(...args)),
          },
        },
        {
          provide: HttpMinisAdapter,
          useValue: {
            list: vi.fn(async () => ({
              minis,
              factionNames: new Map(),
              systemNames: new Map(),
              partOf: new Map(),
            })),
          },
        },
        { provide: HttpPartsAdapter, useValue: { list: vi.fn(async () => []) } },
        {
          provide: HttpKitsAdapter,
          useValue: { find: vi.fn(async () => ({ kits: [BOYZ_KIT], containedKits: new Map() })) },
        },
      ],
    });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(EditBoxPage);
    fixture.componentRef.setInput('id', id);
    await fixture.whenStable();
    return navigate;
  }

  const all = (testId: string): HTMLElement[] => [
    ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(`[data-testid="${testId}"]`),
  ];
  const textOf = (testId: string): string => all(testId)[0]?.textContent?.trim() ?? '';
  const counts = (): string[] => all('box-edit-count').map((count) => count.textContent?.trim() ?? '');
  const click = async (element: HTMLElement | undefined): Promise<void> => {
    element?.click();
    await fixture.whenStable();
  };

  it('starts each row at the minis on the sprue of that row', async () => {
    await showPage(BOYZ.id);

    expect(counts()).toEqual(['5', '1']);
  });

  it('says how many minis on the sprue will be deleted for good while rows are lowered', async () => {
    await showPage(BOYZ.id);
    const before = all('box-edit-delete-note');

    await click(all('box-edit-less')[0]);
    await click(all('box-edit-less')[0]);

    expect(before).toHaveLength(0);
    expect(textOf('box-edit-delete-note')).toBe('2 minis on the sprue will be deleted for good.');
  });

  it('saves the counted rows and leads back to the box', async () => {
    const navigate = await showPage(BOYZ.id);
    await click(all('box-edit-more')[1]);

    await click(all('box-edit-save')[0]);

    expect(editRows).toHaveBeenCalledExactlyOnceWith(BOYZ.id, [5, 2]);
    expect(navigate).toHaveBeenCalledWith(['/hoard/boxes', BOYZ.id], { replaceUrl: true, state: { isEmptied: false } });
  });

  it('leaves without saving when cancelled', async () => {
    const navigate = await showPage(BOYZ.id);
    await click(all('box-edit-more')[1]);

    await click(all('box-edit-cancel')[0]);

    expect(editRows).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/hoard/boxes', BOYZ.id]);
  });

  it('only leads back when saved without a change', async () => {
    const navigate = await showPage(BOYZ.id);

    await click(all('box-edit-save')[0]);

    expect(editRows).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledOnce();
  });

  it("says that it can't be saved when the server does not answer, keeping the counted rows", async () => {
    await showPage(BOYZ.id);
    editRows.mockRejectedValue(new Error('offline'));
    await click(all('box-edit-less')[0]);

    await click(all('box-edit-save')[0]);

    expect(textOf('box-edit-error')).toBe("Can't save right now. Try again in a moment.");
    expect(counts()).toEqual(['4', '1']);
  });

  it('starts with the focus on the title', async () => {
    await showPage(BOYZ.id);

    expect(document.activeElement).toBe(all('box-edit-title')[0]);
  });

  it('asks on the box whether to delete it once editing took out its last minis', async () => {
    const navigate = await showPage(BOYZ.id, [mini('m1', 'Boy', 'sprue')]);
    editRows.mockResolvedValueOnce({ box: BOYZ, addedMinis: [], deletedMiniIds: ['m1'], minis: [] });
    await click(all('box-edit-less')[0]);

    await click(all('box-edit-save')[0]);

    expect(navigate).toHaveBeenCalledWith(['/hoard/boxes', BOYZ.id], { replaceUrl: true, state: { isEmptied: true } });
  });

  it('updates the minis that named a mini deleted while editing the box', async () => {
    const stripped = mini('m5', 'Boy', 'built', {
      departure: { reason: 'stripped', on: '2026-10-20', recipientMiniIds: ['m1'] },
    });
    const withoutRecipients = { ...stripped, departure: { reason: 'stripped' as const, on: '2026-10-20' } };
    await showPage(BOYZ.id, [mini('m1', 'Boy', 'sprue'), mini('m2', 'Boy', 'sprue'), stripped]);
    editRows.mockResolvedValueOnce({ box: BOYZ, addedMinis: [], deletedMiniIds: ['m1'], minis: [withoutRecipients] });
    await click(all('box-edit-less')[0]);

    await click(all('box-edit-save')[0]);

    expect(
      TestBed.inject(MinisStore)
        .minis()
        .find((each) => each.id === 'm5'),
    ).toEqual(withoutRecipients);
  });

  it('says that the box is not in the hoard', async () => {
    await showPage('other');

    expect(textOf('box-edit-none')).toBe("This box isn't in your hoard.");
  });

  it("says that a box without a kit can't be edited", async () => {
    await showPage(LOOSE.id);

    expect(textOf('box-edit-no-kit')).toBe("This box has no kit, so it can't be edited.");
  });
});
