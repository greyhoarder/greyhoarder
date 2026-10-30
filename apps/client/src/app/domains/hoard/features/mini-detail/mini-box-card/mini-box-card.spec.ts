import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { Box, Kit, KitSlot } from '@greyhoarder/domain/hoard';
import { MiniBoxCard } from './mini-box-card';

const slot = (count: number, names: string[], parts: string[] = []): KitSlot => ({
  count,
  names,
  parts,
  factionIds: [],
});

const LOOTAS: Kit = {
  id: 'games-workshop/orks/lootas-2008',
  version: 1,
  name: 'Lootas',
  names: ['Lootas', 'Burna Boyz'],
  manufacturer: 'games-workshop',
  factionIds: ['warhammer-40000/orks'],
  year: 2008,
  sku: '50-14',
  isDraft: false,
  variants: [
    { name: 'Lootas', slots: [slot(4, ['Loota'], ['Deffgun']), slot(1, ['Spanner'])], minis: 5 },
    {
      name: 'Burna Boyz',
      slots: [slot(4, ['Burna Boy'], ['Burna']), slot(1, ['Spanner'])],
      minis: 5,
    },
  ],
  minis: 5,
  contains: [],
};

const BOX: Box = {
  id: 'b1',
  name: 'Lootas (2008)',
  kit: { id: LOOTAS.id, version: 1, name: 'Lootas (2008)', sku: '50-14' },
  factionIds: ['warhammer-40000/orks'],
  tags: [],
  addedOn: '2026-10-12',
  number: 1,
};

describe('Mini box card', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  const render = async (
    inputs: { box?: Box; kit?: Kit; percent?: number; name?: string } = {},
  ): Promise<HTMLElement> => {
    const fixture = TestBed.createComponent(MiniBoxCard);
    fixture.componentRef.setInput('box', inputs.box ?? BOX);
    fixture.componentRef.setInput('kit', 'kit' in inputs ? inputs.kit : LOOTAS);
    fixture.componentRef.setInput('percent', inputs.percent ?? 27);
    fixture.componentRef.setInput('name', inputs.name ?? '');
    await fixture.whenStable();
    return fixture.nativeElement;
  };
  const textOf = (element: Element | null): string => element?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  const suggestedParts = (card: HTMLElement): string[] =>
    [...card.querySelectorAll('[data-testid="mini-box-part"]')].map(textOf);

  it("shows the kit's names and year with its manufacturer, linking to the box", async () => {
    const card = await render();

    const link = card.querySelector('[data-testid="mini-origin"]');
    expect(textOf(link)).toContain('Lootas or Burna Boyz · 2008');
    expect(textOf(link)).toContain('Games Workshop · 50-14');
    expect(link?.getAttribute('href')).toBe('/hoard/boxes/b1');
  });

  it("shows the box's name without a kit", async () => {
    const card = await render({ box: { ...BOX, kit: undefined }, kit: undefined });

    expect(textOf(card.querySelector('[data-testid="mini-origin"]'))).toBe('Lootas (2008)');
    expect(textOf(card)).not.toContain('Kits only suggest');
  });

  it('says when the box was added and how far it is', async () => {
    const card = await render({ percent: 27 });

    expect(textOf(card.querySelector('[data-testid="mini-box-added"]'))).toBe('Added 12 Oct 2026 · box #1 at 27%');
  });

  it('shows the parts the kit suggests for the name the minis are built as', async () => {
    const card = await render({ name: 'Loota' });

    expect(textOf(card)).toContain('The kit suggests for a Loota');
    expect(suggestedParts(card)).toEqual(['Deffgun']);
  });

  it('shows no suggested parts when no name is chosen or the kit offers none', async () => {
    const cards = [await render({ name: '' }), await render({ name: 'Spanner' })];

    expect(cards.map((card) => suggestedParts(card))).toEqual([[], []]);
    expect(cards.map((card) => textOf(card).includes('The kit suggests for'))).toEqual([false, false]);
  });
});
