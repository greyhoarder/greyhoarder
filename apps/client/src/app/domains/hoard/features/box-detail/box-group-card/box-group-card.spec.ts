import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import type { Mini } from '@greyhoarder/domain/hoard';
import { HttpMinisAdapter } from '../../../infrastructure/http-minis-adapter';
import { MiniEditor } from '../../../application/minis/mini-editor';
import { LeavePanel } from '../../../ui/leave-panel/leave-panel';
import type { MiniGroup } from '../mini-group';
import { BoxGroupCard } from './box-group-card';

const NOBS: MiniGroup = {
  id: 'nobs',
  name: 'Boss Nob',
  factions: ['Orks'],
  parts: ['Power Klaw', 'Boss Pole'],
  minis: [
    { id: 'm1', name: 'Boss Nob', status: 'painted', isOnWorkbench: true },
    { id: 'm2', name: 'Boss Nob', status: 'built', isOnWorkbench: false },
    { id: 'm3', name: 'Boss Nob', status: 'built', isOnWorkbench: false },
  ],
  counts: { painted: 1, built: 2 },
};

describe('Group card of a box', () => {
  let fixture: ComponentFixture<BoxGroupCard>;

  const render = async (group: MiniGroup = NOBS): Promise<HTMLElement> => {
    fixture = TestBed.createComponent(BoxGroupCard);
    fixture.componentRef.setInput('group', group);
    fixture.componentRef.setInput('boxFactions', ['Orks']);
    await fixture.whenStable();

    return fixture.nativeElement;
  };

  const all = (card: HTMLElement, testId: string): HTMLElement[] => [
    ...card.querySelectorAll<HTMLElement>(`[data-testid="${testId}"]`),
  ];

  const open = async (card: HTMLElement): Promise<void> => {
    all(card, 'box-group-toggle')[0]?.click();
    await fixture.whenStable();
  };

  const statusButton = (line: HTMLElement | undefined, status: string): HTMLElement | null | undefined =>
    line?.querySelector<HTMLElement>(`[data-testid="box-group-status"][data-status="${status}"]`);

  it('shows the factions of the group only when they differ from those of the box', async () => {
    const cards = [await render(), await render({ ...NOBS, factions: ['Freebooterz'] })];

    expect(cards.map((card) => card.textContent?.includes('Freebooterz'))).toEqual([false, true]);
    expect(cards[0]?.textContent).not.toContain('Orks');
  });

  it('shows the parts of the group', async () => {
    const card = await render();

    expect(card.textContent).toContain('Power Klaw');
    expect(card.textContent).toContain('Boss Pole');
  });

  it('shows its minis only once it is opened', async () => {
    const card = await render();
    const closed = all(card, 'box-group-mini').length;

    await open(card);

    expect([closed, all(card, 'box-group-mini').length]).toEqual([0, 3]);
  });

  it('tells screen readers how many minis the group holds', async () => {
    const card = await render();

    expect(card.querySelector('[aria-label$=" minis"]')?.getAttribute('aria-label')).toBe('3 minis');
  });

  it('marks the minis of the group that are on the workbench', async () => {
    const card = await render();

    await open(card);

    expect(all(card, 'box-group-mini').map((line) => line.textContent?.includes('Workbench'))).toEqual([
      true,
      false,
      false,
    ]);
  });

  it('shows the status of each of its minis as chosen', async () => {
    const card = await render();

    await open(card);

    expect(statusButton(all(card, 'box-group-mini')[0], 'painted')?.getAttribute('aria-pressed')).toBe('true');
  });

  it('hands on a status chosen for one of its minis', async () => {
    const card = await render();
    await open(card);
    const chosen = vi.fn();
    fixture.componentInstance.statusChosen.subscribe(chosen);

    statusButton(all(card, 'box-group-mini')[1], 'primed')?.click();

    expect(chosen).toHaveBeenCalledWith({ miniId: 'm2', status: 'primed' });
  });

  it('offers no status the mini already has', async () => {
    const card = await render();
    await open(card);
    const chosen = vi.fn();
    fixture.componentInstance.statusChosen.subscribe(chosen);

    statusButton(all(card, 'box-group-mini')[1], 'built')?.click();

    expect(chosen).not.toHaveBeenCalled();
  });

  it('selects a mini by its check', async () => {
    const card = await render();
    await open(card);
    const selected = vi.fn();
    fixture.componentInstance.selectedChange.subscribe(selected);

    all(card, 'box-group-mini-check')[1]?.click();

    expect(selected).toHaveBeenCalledExactlyOnceWith({ miniId: 'm2', isSelected: true });
  });

  it('selects a mini by a click on its line in selection mode', async () => {
    const card = await render();
    fixture.componentRef.setInput('isSelectionMode', true);
    await open(card);
    const selected = vi.fn();
    const opened = vi.fn();
    fixture.componentInstance.selectedChange.subscribe(selected);
    fixture.componentInstance.miniOpened.subscribe(opened);

    all(card, 'box-group-mini-open')[0]?.click();

    expect(selected).toHaveBeenCalledExactlyOnceWith({ miniId: 'm1', isSelected: true });
    expect(opened).not.toHaveBeenCalled();
  });

  it('saves a status in selection mode without selecting the mini', async () => {
    const card = await render();
    fixture.componentRef.setInput('isSelectionMode', true);
    await open(card);
    const selected = vi.fn();
    const chosen = vi.fn();
    fixture.componentInstance.selectedChange.subscribe(selected);
    fixture.componentInstance.statusChosen.subscribe(chosen);

    statusButton(all(card, 'box-group-mini')[1], 'primed')?.click();

    expect(chosen).toHaveBeenCalledExactlyOnceWith({ miniId: 'm2', status: 'primed' });
    expect(selected).not.toHaveBeenCalled();
  });

  describe('menu', () => {
    const SOLD = { reason: 'sold', on: '2026-11-01' } as const;

    // The menu opens in an overlay outside the component.
    const menuItem = (testId: string): HTMLElement | null =>
      document.querySelector<HTMLElement>(`[data-testid="${testId}"]`);

    const openMenu = async (card: HTMLElement): Promise<void> => {
      all(card, 'box-group-menu')[0]?.click();
      await fixture.whenStable();
    };

    const openLeavePanel = async (card: HTMLElement): Promise<void> => {
      await openMenu(card);
      menuItem('box-group-leave')?.click();
      await fixture.whenStable();
    };

    const leavePanel = (): LeavePanel => fixture.debugElement.query(By.directive(LeavePanel)).componentInstance;
    const editor = (): MiniEditor => fixture.debugElement.injector.get(MiniEditor);

    it('offers to let the group leave the hoard and to delete it from its menu', async () => {
      const card = await render();

      await openMenu(card);

      expect(menuItem('box-group-leave')?.textContent?.trim()).toBe('Leave the hoard…');
      expect(menuItem('box-group-delete')?.textContent?.trim()).toBe('Delete…');
    });

    it('lets every mini of the group leave the hoard, without asking how many', async () => {
      const card = await render();
      const leaveMinis = vi.spyOn(editor(), 'leaveMinis').mockResolvedValue(true);
      await openLeavePanel(card);

      leavePanel().left.emit({ departure: SOLD, count: 1 });
      await fixture.whenStable();

      expect(leaveMinis).toHaveBeenCalledExactlyOnceWith(['m1', 'm2', 'm3'], SOLD);
      expect(all(card, 'box-group-panel')).toHaveLength(0);
    });

    it('hands over every mini of the group when deleting is chosen', async () => {
      const card = await render();
      const chosen = vi.fn();
      fixture.componentInstance.deleteChosen.subscribe(chosen);
      await openMenu(card);

      menuItem('box-group-delete')?.click();

      expect(chosen).toHaveBeenCalledExactlyOnceWith(new Set(['m1', 'm2', 'm3']));
    });

    it('keeps the panel open and says so when leaving fails', async () => {
      const card = await render();
      vi.spyOn(editor(), 'leaveMinis').mockImplementation(async () => {
        editor().saveState.set('failed');

        return false;
      });
      await openLeavePanel(card);

      leavePanel().left.emit({ departure: SOLD, count: 1 });
      await fixture.whenStable();

      expect(all(card, 'box-group-panel')).toHaveLength(1);
      expect(all(card, 'mini-save-error')).toHaveLength(1);
    });

    it('does not offer the minis of the group as recipients of their parts', async () => {
      const miniOf = (id: string, name: string): Mini => ({
        id,
        name,
        factionIds: [],
        status: 'built',
        parts: [],
        isOnWorkbench: false,
      });

      TestBed.configureTestingModule({
        providers: [
          {
            provide: HttpMinisAdapter,
            useValue: {
              list: vi.fn(async () => ({
                minis: [
                  miniOf('m1', 'Boss Nob'),
                  miniOf('m2', 'Boss Nob'),
                  miniOf('m3', 'Boss Nob'),
                  miniOf('m4', 'Boy'),
                ],
                factionNames: new Map(),
                systemNames: new Map(),
              })),
            },
          },
        ],
      });
      const card = await render();
      await fixture.whenStable();

      await openLeavePanel(card);

      expect(
        leavePanel()
          .recipientChoices()
          .map((choice) => choice.id),
      ).toEqual(['m4']);
    });

    it('closes the panel without changes on cancel', async () => {
      const card = await render();
      const leaveMinis = vi.spyOn(editor(), 'leaveMinis');
      await openLeavePanel(card);

      leavePanel().closed.emit();
      await fixture.whenStable();

      expect(all(card, 'box-group-panel')).toHaveLength(0);
      expect(leaveMinis).not.toHaveBeenCalled();
    });
  });
});
