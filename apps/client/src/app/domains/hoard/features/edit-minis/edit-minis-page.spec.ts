import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import type { Box, Mini } from '@greyhoarder/domain/hoard';
import { HttpCatalogFactionsAdapter, HttpCatalogPartsAdapter, HttpKitsAdapter } from '../../../catalog/api';
import { HttpBoxesAdapter } from '../../infrastructure/http-boxes-adapter';
import { HttpMinisAdapter } from '../../infrastructure/http-minis-adapter';
import { HttpPartsAdapter } from '../../infrastructure/http-parts-adapter';
import { EditMinisPage } from './edit-minis-page';

const ORKS = 'warhammer-40000/orks';
const BLOOD_AXES = 'own-blood-axes';

const BOYZ: Box = { id: 'b1', name: 'Boyz', factionIds: [ORKS], tags: [], addedOn: '2026-10-12', number: 1 };

const mini = (id: string, overrides: Partial<Mini> = {}): Mini => ({
  id,
  name: 'Boy',
  factionIds: [ORKS],
  status: 'built',
  parts: [],
  boxId: BOYZ.id,
  isOnWorkbench: false,
  ...overrides,
});

/** Three built Boyz and two primed Nobz of the Blood Axes. */
const MINIS: Mini[] = [
  mini('m1'),
  mini('m2'),
  mini('m3'),
  mini('m4', { name: 'Nob', status: 'primed', factionIds: [ORKS, BLOOD_AXES] }),
  mini('m5', { name: 'Nob', status: 'primed', factionIds: [ORKS, BLOOD_AXES] }),
  mini('done', { status: 'done' }),
  mini('sold', { departure: { reason: 'sold', on: '2026-10-20' } }),
];

const ALL = 'm1,m2,m3,m4,m5';

/** Where the page leads back to. */
@Component({ template: '' })
class Elsewhere {}

describe('Edit minis page', () => {
  let fixture: ComponentFixture<EditMinisPage>;
  let change = vi.fn<HttpMinisAdapter['change']>();

  /** A fresh page for the minis with these ids, opened from the hoard or from the box. */
  async function showPage(ids: string, box?: string): Promise<void> {
    change = vi.fn(async () => ({ minis: [], ownFactionNames: new Map() }));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: '**', component: Elsewhere }]),
        {
          provide: HttpBoxesAdapter,
          useValue: { list: vi.fn(async () => ({ boxes: [BOYZ], factionNames: new Map() })) },
        },
        {
          provide: HttpMinisAdapter,
          useValue: {
            list: vi.fn(async () => ({
              minis: MINIS,
              factionNames: new Map([
                [ORKS, 'Orks'],
                [BLOOD_AXES, 'Blood Axes'],
              ]),
              systemNames: new Map(),
              partOf: new Map(),
            })),
            change: vi.fn((...args: Parameters<HttpMinisAdapter['change']>) => change(...args)),
          },
        },
        { provide: HttpPartsAdapter, useValue: { list: vi.fn(async () => []) } },
        { provide: HttpCatalogFactionsAdapter, useValue: { search: vi.fn(async () => []) } },
        { provide: HttpCatalogPartsAdapter, useValue: { rangeParts: vi.fn(async () => []) } },
        { provide: HttpKitsAdapter, useValue: { find: vi.fn(async () => ({ kits: [], containedKits: new Map() })) } },
      ],
    });
    fixture = TestBed.createComponent(EditMinisPage);
    fixture.componentRef.setInput('ids', ids);
    if (box !== undefined) {
      fixture.componentRef.setInput('box', box);
    }
    await fixture.whenStable();
  }

  const all = (testId: string): HTMLElement[] => [
    ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(`[data-testid="${testId}"]`),
  ];
  const textOf = (testId: string): string => all(testId)[0]?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  const click = async (element: HTMLElement | undefined): Promise<void> => {
    element?.click();
    await fixture.whenStable();
  };
  const statusChip = (status: string): HTMLElement | undefined =>
    all('edit-minis-status').find((chip) => chip.dataset['status'] === status);
  const factionChip = (name: string): HTMLElement | undefined =>
    all('edit-minis-faction').find((chip) => chip.textContent?.includes(name));
  const removeButtonOf = (name: string): HTMLElement | null | undefined =>
    factionChip(name)?.querySelector<HTMLElement>('[data-testid="edit-minis-faction-remove"]');

  it('says how many minis are edited and which, e.g. "Boy ×3, Nob ×2"', async () => {
    await showPage(ALL);

    const header = { title: textOf('edit-minis-title'), names: textOf('edit-minis-names') };

    expect(header).toEqual({ title: 'Edit 5 minis', names: 'Boy ×3, Nob ×2' });
  });

  it("chooses no status while the minis don't share one", async () => {
    await showPage(ALL);

    const checked = all('edit-minis-status').filter((chip) => chip.getAttribute('aria-checked') === 'true');

    expect(checked).toHaveLength(0);
    expect(textOf('edit-minis-status-mixed')).toBe('Mixed: 3 built, 2 primed');
  });

  it('shows "2 of 5" for a faction some of the minis carry', async () => {
    await showPage(ALL);

    const share = factionChip('Blood Axes')?.querySelector('[data-testid="edit-minis-faction-share"]');

    expect(share?.textContent?.trim()).toBe('2 of 5');
  });

  it('keeps "Apply" disabled while nothing changed', async () => {
    await showPage(ALL);

    const apply = all('edit-minis-apply')[0] as HTMLButtonElement | undefined;

    expect(apply?.disabled).toBe(true);
    expect(textOf('edit-minis-summary')).toBe('Nothing changed yet.');
  });

  it('sends only what the user changed when applying', async () => {
    await showPage(ALL);
    await click(statusChip('painted'));

    await click(all('edit-minis-apply')[0]);

    expect(change).toHaveBeenCalledWith(['m1', 'm2', 'm3', 'm4', 'm5'], { status: 'painted' });
  });

  it('marks a faction to be removed and takes it back with "Undo"', async () => {
    await showPage(ALL);
    await click(removeButtonOf('Blood Axes') ?? undefined);
    const marked = removeButtonOf('Blood Axes')?.getAttribute('aria-label');

    await click(removeButtonOf('Blood Axes') ?? undefined);

    expect(marked).toBe('Undo removing Blood Axes');
    expect(removeButtonOf('Blood Axes')?.getAttribute('aria-label')).toBe('Remove Blood Axes');
    expect(textOf('edit-minis-summary')).toBe('Nothing changed yet.');
  });

  it("says how many minis can't go on the workbench when putting them on", async () => {
    await showPage('m1,done,sold');

    await click(all('edit-minis-workbench').find((choice) => choice.dataset['choice'] === 'put-on'));

    expect(textOf('edit-minis-workbench-note')).toBe("2 of them can't go on the workbench: done or gone.");
  });

  it('leads back to where the minis were selected after applying', async () => {
    await showPage(ALL, BOYZ.id);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    await click(statusChip('painted'));

    await click(all('edit-minis-apply')[0]);

    expect(navigate).toHaveBeenCalledWith(['/hoard/boxes', BOYZ.id], { replaceUrl: true });
  });

  it('changes nothing when cancelled', async () => {
    await showPage(ALL);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    await click(statusChip('painted'));

    await click(all('edit-minis-cancel')[0]);

    expect(change).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/hoard/minis']);
  });

  it("says that the minis can't be changed when the server does not answer, keeping the changes", async () => {
    await showPage(ALL);
    change.mockRejectedValue(new Error('offline'));
    await click(statusChip('painted'));

    await click(all('edit-minis-apply')[0]);

    expect(textOf('edit-minis-apply-error')).toBe("Can't change the minis right now. Try again in a moment.");
    expect(statusChip('painted')?.getAttribute('aria-checked')).toBe('true');
  });

  it('leaves out minis that are no longer in the hoard and says how many', async () => {
    await showPage('m1,m2,deleted');

    const header = { title: textOf('edit-minis-title'), missing: textOf('edit-minis-missing') };

    expect(header).toEqual({
      title: 'Edit 2 minis',
      missing: '1 of the selected minis are no longer in your hoard and are left out.',
    });
  });

  it('says that none of the minis is in the hoard', async () => {
    await showPage('deleted,other');

    const message = textOf('edit-minis-none');

    expect(message).toBe('None of these minis is in your hoard.');
    expect(all('edit-minis-apply')).toHaveLength(0);
  });
});
