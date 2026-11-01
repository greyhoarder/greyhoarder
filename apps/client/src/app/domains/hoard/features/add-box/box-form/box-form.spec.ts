import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Kit } from '@greyhoarder/domain/hoard';
import type { BoxesToAdd } from '../../../models/boxes-to-add';
import { BoxForm } from './box-form';

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
      slots: [
        { count: 9, names: ['Boy'], parts: ['Slugga', 'Choppa'], factionIds: [] },
        { count: 1, names: ['Nob'], parts: ['Power Klaw'], factionIds: [] },
        { count: 1, names: ['Ammo Runt'], parts: [], factionIds: [] },
      ],
      minis: 11,
    },
  ],
  minis: 11,
  contains: [],
};

const LOOTAS_OR_BURNA_BOYZ: Kit = {
  id: 'games-workshop/orks/lootas-2008',
  version: 1,
  name: 'Lootas',
  names: ['Lootas', 'Burna Boyz'],
  manufacturer: 'games-workshop',
  factionIds: ['warhammer-40000/orks'],
  isDraft: true,
  variants: [
    {
      name: 'Lootas',
      slots: [{ count: 5, names: ['Loota'], parts: ['Deffgun'], factionIds: [] }],
      minis: 5,
    },
    {
      name: 'Burna Boyz',
      slots: [{ count: 5, names: ['Burna Boy'], parts: ['Burna'], factionIds: [] }],
      minis: 5,
    },
  ],
  minis: 5,
  contains: [],
};

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

describe('Box form', () => {
  let fixture: ComponentFixture<BoxForm>;

  async function openForm(
    kit: Kit,
    {
      areSprues = false,
      matchedRows = [],
      onlyArmy,
    }: { areSprues?: boolean; matchedRows?: number[]; onlyArmy?: string } = {},
  ): Promise<void> {
    fixture = TestBed.createComponent(BoxForm);
    fixture.componentRef.setInput('kit', kit);
    fixture.componentRef.setInput('areSprues', areSprues);
    fixture.componentRef.setInput('matchedRows', matchedRows);
    fixture.componentRef.setInput('factionNames', FACTION_NAMES);
    fixture.componentRef.setInput('onlyArmy', onlyArmy);
    await fixture.whenStable();
  }

  const form = (): HTMLElement => fixture.nativeElement;
  const byTestId = <T extends HTMLElement = HTMLElement>(id: string): T | null =>
    form().querySelector<T>(`[data-testid="${id}"]`);
  const allText = (id: string): string[] =>
    [...form().querySelectorAll(`[data-testid="${id}"]`)].map((element) =>
      (element.textContent ?? '').replace(/\s+/g, ' ').trim(),
    );

  async function click(id: string, index = 0): Promise<void> {
    form().querySelectorAll<HTMLElement>(`[data-testid="${id}"]`)[index]?.click();
    await fixture.whenStable();
  }

  async function typeName(name: string): Promise<void> {
    const input = byTestId<HTMLInputElement>('add-box-name');
    if (input) {
      input.value = name;
      input.dispatchEvent(new Event('input'));
    }
    await fixture.whenStable();
  }

  /** What a row shows, by part, wherever in the row it is. */
  function rowParts(index: number): Record<'count' | 'name' | 'builds' | 'parts', string[]> {
    const row = form().querySelectorAll<HTMLElement>('[data-testid="add-box-slot"]')[index];
    const texts = (testId: string) =>
      [...row.querySelectorAll(`[data-testid="${testId}"]`)].map((element) => element.textContent?.trim() ?? '');
    return {
      count: texts('add-box-slot-count'),
      name: texts('add-box-slot-name'),
      builds: texts('add-box-slot-builds'),
      parts: texts('add-box-slot-part'),
    };
  }

  async function typeTag(tag: string): Promise<void> {
    const input = byTestId<HTMLInputElement>('add-box-new-tag');
    if (input) {
      input.value = tag;
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    }
    await fixture.whenStable();
  }

  it('shows one row per slot for a kit with one variant, each counting the minis of one box', async () => {
    await openForm(BOYZ);

    expect(allText('add-box-slot-count')).toEqual(['9', '1', '1']);
    expect(rowParts(0)).toEqual({ count: ['9'], name: ['Boy'], builds: [], parts: ['Slugga', 'Choppa'] });
  });

  it('shows an either-or kit as undecided minis named after the kit, with the parts of every variant', async () => {
    await openForm(LOOTAS_OR_BURNA_BOYZ);

    expect(allText('add-box-slot')).toHaveLength(1);
    expect(rowParts(0)).toEqual({
      count: ['5'],
      name: ['Lootas / Burna Boyz'],
      builds: ['Each can become Loota or Burna Boy.'],
      parts: ['Deffgun', 'Burna'],
    });
  });

  it('counts the minis of every box', async () => {
    await openForm(LOOTAS_OR_BURNA_BOYZ);

    await click('add-box-more');

    expect(allText('add-box-slot-count')).toEqual(['5']);
    expect(allText('add-box-submit')).toEqual(['Add 10 minis']);
  });

  it('does not go below one box', async () => {
    await openForm(BOYZ);

    expect(byTestId<HTMLButtonElement>('add-box-less')?.disabled).toBe(true);
  });

  it('adds a typed tag and selects it', async () => {
    await openForm(BOYZ);

    await typeTag('Birthday');

    const tag = byTestId('add-box-tag');
    expect(tag?.textContent?.trim()).toBe('Birthday');
    expect(tag?.getAttribute('aria-pressed')).toBe('true');
  });

  it('hands over the number of boxes, the name, the counted rows and the selected tags when adding', async () => {
    await openForm(BOYZ);
    const added: BoxesToAdd[] = [];
    fixture.componentInstance.add.subscribe((choice) => added.push(choice));
    await click('add-box-more');
    await typeName('Birthday Boyz');
    await click('add-box-slot-more', 0);
    await typeTag('Birthday');
    await typeTag('Second hand');
    await click('add-box-tag');

    await click('add-box-submit');

    expect(added).toEqual([
      { boxes: 2, name: 'Birthday Boyz', rows: [10, 1, 1], tags: ['Second hand'], areSprues: false },
    ]);
  });

  it('names the box after its kit and year, e.g. "Boyz (2026)"', async () => {
    await openForm(BOYZ);

    expect(byTestId<HTMLInputElement>('add-box-name')?.value).toBe('Boyz (2026)');
  });

  it('names sprues after their kit, e.g. "Boyz sprues (2026)"', async () => {
    await openForm(BOYZ, { areSprues: true });

    expect(byTestId<HTMLInputElement>('add-box-name')?.value).toBe('Boyz sprues (2026)');
  });

  it('says "Give the box a name." and adds nothing while the name is empty', async () => {
    await openForm(BOYZ);

    await typeName('');

    expect(byTestId('add-box-name-error')?.textContent?.trim()).toBe('Give the box a name.');
    expect(byTestId<HTMLButtonElement>('add-box-submit')?.disabled).toBe(true);
  });

  it('counts one more and one fewer in a row', async () => {
    await openForm(BOYZ);

    await click('add-box-slot-more', 0);
    await click('add-box-slot-more', 0);
    await click('add-box-slot-less', 0);

    expect(allText('add-box-slot-count')).toEqual(['10', '1', '1']);
  });

  it('does not go below no minis in a row', async () => {
    await openForm(BOYZ);

    await click('add-box-slot-less', 2);
    await click('add-box-slot-less', 2);

    expect(allText('add-box-slot-count')).toEqual(['9', '1', '0']);
  });

  it('says "of 10" after a row that differs from the kit', async () => {
    await openForm({
      ...BOYZ,
      variants: [{ name: 'Boyz', slots: [{ count: 10, names: ['Boy'], parts: [], factionIds: [] }], minis: 10 }],
      minis: 10,
    });

    await click('add-box-slot-less');

    expect(allText('add-box-slot-count')).toEqual(['9']);
    expect(allText('add-box-slot-kit-count')).toEqual(['of 10']);
  });

  it('says that the box will be marked as edited while a row differs from the kit', async () => {
    await openForm(BOYZ);

    await click('add-box-slot-more', 1);

    expect(byTestId('add-box-edited-note')?.textContent?.trim()).toBe(
      'Counted by you: the box will be marked as edited.',
    );
  });

  it('sets every row back to the kit with "Reset to the kit"', async () => {
    await openForm(BOYZ);
    await click('add-box-slot-more', 0);
    await click('add-box-slot-less', 2);

    await click('add-box-reset');

    expect(allText('add-box-slot-count')).toEqual(['9', '1', '1']);
    expect(byTestId('add-box-edited-note')).toBeNull();
  });

  it('adds nothing while every row is at none', async () => {
    await openForm(LOOTAS_OR_BURNA_BOYZ);

    for (let mini = 0; mini < 5; mini++) {
      await click('add-box-slot-less');
    }

    expect(byTestId<HTMLButtonElement>('add-box-submit')?.disabled).toBe(true);
  });

  it('starts every row of sprues at none, without a box stepper', async () => {
    await openForm(BOYZ, { areSprues: true });

    expect(allText('add-box-slot-count')).toEqual(['0', '0', '0']);
    expect(byTestId('add-box-count')).toBeNull();
  });

  it('marks the rows whose slots matched the search', async () => {
    await openForm(BOYZ, { matchedRows: [1] });

    const rows = [...form().querySelectorAll('[data-testid="add-box-slot"]')];
    expect(rows.map((row) => row.hasAttribute('data-matched'))).toEqual([false, true, false]);
  });

  it('lists the rows of a kit of two armies under a heading each', async () => {
    await openForm(TWO_ARMIES);

    expect(allText('army-heading')).toEqual(['Space Marines · 2 minis', 'Orks · 3 minis']);
  });

  it('shows no heading for a kit of one army', async () => {
    await openForm(BOYZ);

    expect(allText('army-heading')).toEqual([]);
  });

  it('keeps a row at none under its army and lowers the count of the heading', async () => {
    await openForm(TWO_ARMIES);

    await click('add-box-slot-less', 0);
    await click('add-box-slot-less', 0);

    expect(allText('add-box-slot')).toHaveLength(2);
    expect(allText('army-heading')).toEqual(['Space Marines · 0 minis', 'Orks · 3 minis']);
  });

  it('adds only the minis of the chosen army and hides the rows of the others', async () => {
    await openForm(TWO_ARMIES, { onlyArmy: 'Orks' });
    const added: BoxesToAdd[] = [];
    fixture.componentInstance.add.subscribe((choice) => added.push(choice));

    await click('add-box-submit');

    expect(allText('add-box-slot')).toHaveLength(1);
    expect(added[0]?.rows).toEqual([0, 3]);
  });
});
