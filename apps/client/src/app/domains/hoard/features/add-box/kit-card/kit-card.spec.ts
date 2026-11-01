import { TestBed } from '@angular/core/testing';
import type { Kit } from '@greyhoarder/domain/hoard';
import { KitCard } from './kit-card';

const ORKS = 'warhammer-40000/orks';
const MARINES = 'warhammer-40000/space-marines';
const FACTION_NAMES = new Map([
  [ORKS, 'Orks'],
  [MARINES, 'Space Marines'],
]);

const TWO_ARMIES: Kit = {
  id: 'games-workshop/sets/starter',
  version: 1,
  name: 'Starter',
  names: ['Starter'],
  manufacturer: 'games-workshop',
  factionIds: [MARINES, ORKS],
  isDraft: false,
  variants: [
    {
      name: 'Starter',
      slots: [
        { count: 2, names: ['Marine'], parts: [], factionIds: [MARINES] },
        { count: 3, names: ['Boy'], parts: [], factionIds: [ORKS] },
      ],
      minis: 5,
    },
  ],
  minis: 5,
  contains: [],
};

describe('Kit card', () => {
  it('marks a kit that is not yet checked against a box as "Not checked"', async () => {
    const fixture = TestBed.createComponent(KitCard);
    fixture.componentRef.setInput('factionNames', new Map([['warhammer-40000/orks', 'Orks']]));
    fixture.componentRef.setInput('kit', {
      id: 'games-workshop/orks/boyz-2026',
      name: 'Boyz',
      names: ['Boyz'],
      manufacturer: 'games-workshop',
      factionIds: ['warhammer-40000/orks'],
      isDraft: true,
      variants: [],
      minis: 11,
      contains: [],
    });

    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).querySelector('[data-testid="add-box-kit-draft"]')?.textContent).toBe(
      'Not checked',
    );
  });

  it('shows every name of an either-or kit, e.g. "Lootas or Burna Boyz"', async () => {
    const fixture = TestBed.createComponent(KitCard);
    fixture.componentRef.setInput('factionNames', new Map([['warhammer-40000/orks', 'Orks']]));
    fixture.componentRef.setInput('kit', {
      id: 'games-workshop/orks/lootas-2008',
      name: 'Lootas',
      names: ['Lootas', 'Burna Boyz'],
      manufacturer: 'games-workshop',
      factionIds: ['warhammer-40000/orks'],
      isDraft: true,
      variants: [],
      minis: 5,
      contains: [],
    });

    await fixture.whenStable();

    expect(
      (fixture.nativeElement as HTMLElement)
        .querySelector('[data-testid="add-box-kit-name"]')
        ?.textContent?.replace(/\s+/g, ' ')
        .trim(),
    ).toBe('Lootas or Burna Boyz');
  });

  it('shows how many builds an either-or kit offers', async () => {
    const fixture = TestBed.createComponent(KitCard);
    fixture.componentRef.setInput('factionNames', new Map([['warhammer-40000/orks', 'Orks']]));
    fixture.componentRef.setInput('kit', {
      id: 'games-workshop/orks/lootas-2008',
      name: 'Lootas',
      names: ['Lootas', 'Burna Boyz'],
      manufacturer: 'games-workshop',
      factionIds: ['warhammer-40000/orks'],
      isDraft: true,
      variants: [
        { name: 'Lootas', slots: [], minis: 5 },
        { name: 'Burna Boyz', slots: [], minis: 5 },
      ],
      minis: 5,
      contains: [],
    });

    await fixture.whenStable();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[data-testid="add-box-kit-builds"]')?.textContent?.trim(),
    ).toBe('2 builds');
  });

  it('shows no builds for a kit with one variant', async () => {
    const fixture = TestBed.createComponent(KitCard);
    fixture.componentRef.setInput('factionNames', new Map([['warhammer-40000/orks', 'Orks']]));
    fixture.componentRef.setInput('kit', {
      id: 'games-workshop/orks/boyz-2026',
      name: 'Boyz',
      names: ['Boyz'],
      manufacturer: 'games-workshop',
      factionIds: ['warhammer-40000/orks'],
      isDraft: true,
      variants: [{ name: 'Boyz', slots: [], minis: 11 }],
      minis: 11,
      contains: [],
    });

    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).querySelector('[data-testid="add-box-kit-builds"]')).toBeNull();
  });

  describe('with two armies', () => {
    const render = async (inputs: { isOpen?: boolean; areSprues?: boolean } = {}) => {
      const fixture = TestBed.createComponent(KitCard);
      fixture.componentRef.setInput('factionNames', FACTION_NAMES);
      fixture.componentRef.setInput('kit', TWO_ARMIES);
      fixture.componentRef.setInput('isOpen', inputs.isOpen ?? true);
      fixture.componentRef.setInput('areSprues', inputs.areSprues ?? false);
      await fixture.whenStable();
      const card: HTMLElement = fixture.nativeElement;
      const click = async (element: HTMLElement | null | undefined): Promise<void> => {
        element?.click();
        await fixture.whenStable();
      };
      // The menu opens in an overlay outside the component.
      const choices = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>('[data-testid="add-box-army"]')];
      const openChoices = (): Promise<void> => click(card.querySelector<HTMLElement>('[data-testid="add-box-armies"]'));
      const rows = (): number => card.querySelectorAll('[data-testid="add-box-slot"]').length;
      return { card, click, choices, openChoices, rows };
    };

    it('says the armies of the kit in one line', async () => {
      const { card } = await render({ isOpen: false });

      expect(card.textContent).toContain('Space Marines and Orks');
    });

    it('offers the whole box and each army with its minis on an open card', async () => {
      const { choices, openChoices } = await render();

      await openChoices();

      expect(
        choices().map((choice) => [...choice.querySelectorAll('span')].map((span) => span.textContent).join(' ')),
      ).toEqual(['Whole box 5', 'Only Space Marines 2', 'Only Orks 3']);
    });

    it('offers no choice of armies for sprues', async () => {
      const { card } = await render({ areSprues: true });

      expect(card.querySelector('[data-testid="add-box-armies"]')).toBeNull();
    });

    it('shows every row again when going back to the whole box', async () => {
      const { click, choices, openChoices, rows } = await render();
      await openChoices();
      await click(choices()[2]);
      await openChoices();

      await click(choices()[0]);

      expect(rows()).toBe(2);
    });

    it('goes back to the whole box when the rows are reset', async () => {
      const { card, click, choices, openChoices, rows } = await render();
      await openChoices();
      await click(choices()[2]);

      await click(card.querySelector<HTMLElement>('[data-testid="add-box-reset"]'));

      expect(rows()).toBe(2);
    });
  });
});
