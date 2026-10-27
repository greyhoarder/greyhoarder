import { type ComponentFixture, TestBed } from '@angular/core/testing';
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

  const statusButton = (
    line: HTMLElement | undefined,
    status: string,
  ): HTMLElement | null | undefined =>
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

    expect(card.querySelector('[aria-label$=" minis"]')?.getAttribute('aria-label')).toBe(
      '3 minis',
    );
  });

  it('marks the minis of the group that are on the workbench', async () => {
    const card = await render();

    await open(card);

    expect(
      all(card, 'box-group-mini').map((line) => line.textContent?.includes('Workbench')),
    ).toEqual([true, false, false]);
  });

  it('shows the status of each of its minis as chosen', async () => {
    const card = await render();

    await open(card);

    expect(
      statusButton(all(card, 'box-group-mini')[0], 'painted')?.getAttribute('aria-pressed'),
    ).toBe('true');
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
});
