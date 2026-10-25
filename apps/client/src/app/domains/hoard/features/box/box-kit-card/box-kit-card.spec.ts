import { TestBed } from '@angular/core/testing';
import type { Kit, KitSlot } from '@greyhoarder/domain/hoard';
import { BoxKitCard } from './box-kit-card';

const slot = (count: number, names: string[], parts: string[] = []): KitSlot => ({
  count,
  names,
  parts,
  factionIds: [],
});

const BOYZ: Kit = {
  id: 'games-workshop/orks/boyz-2026',
  version: 1,
  name: 'Boyz',
  names: ['Boyz'],
  manufacturer: 'games-workshop',
  factionIds: ['warhammer-40000/orks'],
  year: 2026,
  sku: '50-80',
  isDraft: true,
  variants: [
    {
      name: 'Boyz',
      slots: [slot(9, ['Boy'], ['Slugga', 'Choppa']), slot(1, ['Nob'], ['Power Klaw'])],
      minis: 10,
    },
  ],
  minis: 10,
  contains: [],
};

const LOOTAS: Kit = {
  ...BOYZ,
  id: 'games-workshop/orks/lootas-2008',
  name: 'Lootas',
  names: ['Lootas', 'Burna Boyz'],
  year: 2008,
  isDraft: false,
  variants: [
    { name: 'Lootas', slots: [slot(5, ['Loota']), slot(1, ['Spanner'])], minis: 6 },
    { name: 'Burna Boyz', slots: [slot(5, ['Burna Boy']), slot(1, ['Spanner'])], minis: 6 },
  ],
  minis: 6,
};

describe('Kit card of a box', () => {
  const render = async (kit: Kit): Promise<HTMLElement> => {
    const fixture = TestBed.createComponent(BoxKitCard);
    fixture.componentRef.setInput('kit', kit);
    await fixture.whenStable();
    return fixture.nativeElement;
  };
  const slotTexts = (card: HTMLElement): string[] =>
    [...card.querySelectorAll('[data-testid="box-kit-slot"]')].map(
      (row) => row.textContent?.replace(/\s+/g, ' ').trim() ?? '',
    );

  it('says the name of the kit with the year of its first release', async () => {
    const card = await render(BOYZ);

    expect(card.textContent?.replace(/\s+/g, ' ')).toContain('Boyz · 2026');
  });

  it('marks a draft kit as not checked', async () => {
    const cards = [await render(BOYZ), await render({ ...BOYZ, isDraft: false })];

    expect(cards.map((card) => card.querySelectorAll('[data-testid="box-kit-draft"]').length)).toEqual([1, 0]);
  });

  it('says the manufacturer and the product code of the kit', async () => {
    const card = await render(BOYZ);

    expect(card.textContent).toContain('Games Workshop · 50-80');
  });

  it('shows one row per slot with its number of minis and what it suggests', async () => {
    const card = await render(BOYZ);

    const rows = [...card.querySelectorAll('[data-testid="box-kit-slot"]')].map((row) => [
      row.children[0]?.textContent?.trim(),
      row.children[1]?.children[0]?.textContent?.trim(),
    ]);
    expect(rows).toEqual([
      ['9×', 'Boy'],
      ['1×', 'Nob'],
    ]);
  });

  it('shows the either-or row first for an either-or kit', async () => {
    const card = await render(LOOTAS);

    expect(slotTexts(card)[0]).toContain('Lootas / Burna Boyz');
  });
});
