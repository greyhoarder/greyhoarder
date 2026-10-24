import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Kit } from '../../../models/kit';
import type { BoxesToAdd } from '../../../models/boxes-to-add';
import { BoxForm } from './box-form';

const BOYZ: Kit = {
  id: 'games-workshop/orks/boyz-2026',
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

describe('Box form', () => {
  let fixture: ComponentFixture<BoxForm>;

  async function openForm(kit: Kit): Promise<void> {
    fixture = TestBed.createComponent(BoxForm);
    fixture.componentRef.setInput('kit', kit);
    await fixture.whenStable();
  }

  const form = (): HTMLElement => fixture.nativeElement;
  const byTestId = <T extends HTMLElement = HTMLElement>(id: string): T | null =>
    form().querySelector<T>(`[data-testid="${id}"]`);
  const allText = (id: string): string[] =>
    [...form().querySelectorAll(`[data-testid="${id}"]`)].map((element) =>
      (element.textContent ?? '').replace(/\s+/g, ' ').trim(),
    );

  /** The texts of a row, piece by piece, e.g. ['9×', 'Boy', 'Slugga', 'Choppa']. */
  const rowTexts = (index: number): string[] =>
    [...form().querySelectorAll('[data-testid="add-box-slot"]')[index].querySelectorAll('span')]
      .filter((span) => span.children.length === 0)
      .map((span) => (span.textContent ?? '').trim());

  async function click(id: string): Promise<void> {
    byTestId(id)?.click();
    await fixture.whenStable();
  }

  async function typeTag(tag: string): Promise<void> {
    const input = byTestId<HTMLInputElement>('add-box-new-tag');
    if (input) {
      input.value = tag;
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    }
    await fixture.whenStable();
  }

  it('shows one row per slot for a kit with one variant', async () => {
    await openForm(BOYZ);

    expect(allText('add-box-slot-count')).toEqual(['9×', '1×', '1×']);
    expect(rowTexts(0)).toEqual(['9×', 'Boy', 'Slugga', 'Choppa']);
  });

  it('shows an either-or kit as undecided minis named after the kit, with the parts of every variant', async () => {
    await openForm(LOOTAS_OR_BURNA_BOYZ);

    expect(allText('add-box-slot')).toHaveLength(1);
    expect(rowTexts(0)).toEqual([
      '5×',
      'Lootas / Burna Boyz',
      'Each can become Loota or Burna Boy.',
      'Deffgun',
      'Burna',
    ]);
  });

  it('counts the minis of every box', async () => {
    await openForm(LOOTAS_OR_BURNA_BOYZ);

    await click('add-box-more');

    expect(allText('add-box-slot-count')).toEqual(['10×']);
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

  it('hands over the number of boxes and the selected tags when adding', async () => {
    await openForm(BOYZ);
    const added: BoxesToAdd[] = [];
    fixture.componentInstance.add.subscribe((choice) => added.push(choice));
    await click('add-box-more');
    await typeTag('Birthday');
    await typeTag('Second hand');
    await click('add-box-tag');

    await click('add-box-submit');

    expect(added).toEqual([{ boxes: 2, tags: ['Second hand'] }]);
  });
});
