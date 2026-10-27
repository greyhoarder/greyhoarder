import { type ComponentFixture, TestBed } from '@angular/core/testing';
import type { HoardGroup } from '../../../application/hoard-group';
import type { MiniRow } from '../../../application/mini-row';
import { MiniGroupCard } from './mini-group-card';

const row = (id: string, box?: string): MiniRow => ({
  id,
  name: 'Boy',
  factions: ['Orks'],
  box,
  parts: ['Slugga', 'Choppa'],
  status: 'built',
  isOnWorkbench: false,
  count: 1,
});

const group = (rows: MiniRow[]): HoardGroup => ({
  id: 'boyz',
  name: 'Boy',
  factions: ['Orks'],
  parts: ['Slugga', 'Choppa'],
  boxes: [...new Set(rows.map((each) => each.box))],
  rows,
  counts: { built: rows.length },
});

const ONE_BOX = group([row('m1', 'Boyz (2026)'), row('m2', 'Boyz (2026)')]);

describe('Group card of the hoard', () => {
  let fixture: ComponentFixture<MiniGroupCard>;

  /** The card opens and closes as a page would open and close it. */
  const render = async (shown: HoardGroup): Promise<HTMLElement> => {
    fixture = TestBed.createComponent(MiniGroupCard);
    fixture.componentRef.setInput('group', shown);
    fixture.componentInstance.toggled.subscribe(() =>
      fixture.componentRef.setInput('isOpen', !fixture.componentInstance.isOpen()),
    );
    await fixture.whenStable();
    return fixture.nativeElement;
  };

  const all = (card: HTMLElement, testId: string): HTMLElement[] => [
    ...card.querySelectorAll<HTMLElement>(`[data-testid="${testId}"]`),
  ];

  const open = async (card: HTMLElement): Promise<void> => {
    all(card, 'hoard-group-toggle')[0]?.click();
    await fixture.whenStable();
  };

  it('shows the name, the factions and the box of the group', async () => {
    const card = await render(ONE_BOX);

    expect(card.textContent).toContain('Boy');
    expect(card.textContent).toContain('Orks · Boyz (2026)');
  });

  it('says how many boxes the minis come from when there are several', async () => {
    const card = await render(group([row('m1', 'Boyz (2026)'), row('m2', 'Boyz (2021)')]));

    expect(card.textContent).toContain('Orks · 2 boxes');
  });

  it('shows the parts of the group', async () => {
    const card = await render(ONE_BOX);

    expect(card.textContent).toContain('Slugga');
    expect(card.textContent).toContain('Choppa');
  });

  it('shows its minis only once it is opened', async () => {
    const card = await render(ONE_BOX);
    const closed = all(card, 'hoard-row').length;

    await open(card);

    expect([closed, all(card, 'hoard-row').length]).toEqual([0, 2]);
  });

  it('tells screen readers whether the group is open', async () => {
    const card = await render(ONE_BOX);
    const toggle = all(card, 'hoard-group-toggle')[0];
    const closed = toggle?.getAttribute('aria-expanded');

    await open(card);

    expect([closed, toggle?.getAttribute('aria-expanded')]).toEqual(['false', 'true']);
  });

  it('tells screen readers how many minis the group holds', async () => {
    const cards = [await render(ONE_BOX), await render(group([row('m1', 'Boyz (2026)')]))];

    expect(
      cards.map((card) =>
        card
          .querySelector('[aria-label$=" mini"], [aria-label$=" minis"]')
          ?.getAttribute('aria-label'),
      ),
    ).toEqual(['2 minis', '1 mini']);
  });
});
