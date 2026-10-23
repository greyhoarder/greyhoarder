import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { KitOption } from '../../../util/kit-option';
import type { BoxChoice } from '../../../util/new-box';
import { BoxForm } from './box-form';

const BOYZ: KitOption = {
  id: 'games-workshop/orks/boyz-2026',
  name: 'Boyz',
  manufacturer: 'Games Workshop',
  factions: ['Orks'],
  year: 2026,
  sku: '50-80',
  isDraft: true,
  variants: [
    {
      name: 'Boyz',
      slots: [
        { count: 9, names: ['Boy'], parts: ['Slugga', 'Choppa'], factions: [] },
        { count: 1, names: ['Nob'], parts: ['Power Klaw'], factions: [] },
        { count: 1, names: ['Ammo Runt'], parts: [], factions: [] },
      ],
      minis: 11,
    },
  ],
  minis: 11,
};

const LOOTAS_OR_BURNA_BOYZ: KitOption = {
  id: 'games-workshop/orks/lootas-burna-boyz',
  name: 'Lootas / Burna Boyz',
  manufacturer: 'Games Workshop',
  factions: ['Orks'],
  isDraft: true,
  variants: [
    {
      name: 'Lootas',
      slots: [{ count: 5, names: ['Loota'], parts: ['Deffgun'], factions: [] }],
      minis: 5,
    },
    {
      name: 'Burna Boyz',
      slots: [{ count: 5, names: ['Burna Boy'], parts: ['Burna'], factions: [] }],
      minis: 5,
    },
  ],
  minis: 5,
};

describe('Box form', () => {
  let fixture: ComponentFixture<BoxForm>;

  async function openForm(kit: KitOption): Promise<void> {
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

  it('shows an either-or kit as undecided minis named after the kit', async () => {
    await openForm(LOOTAS_OR_BURNA_BOYZ);

    expect(allText('add-box-slot')).toHaveLength(1);
    expect(rowTexts(0)).toEqual([
      '5×',
      'Lootas / Burna Boyz',
      'Each can become Loota or Burna Boy.',
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
    const added: BoxChoice[] = [];
    fixture.componentInstance.add.subscribe((choice) => added.push(choice));
    await click('add-box-more');
    await typeTag('Birthday');
    await typeTag('Second hand');
    await click('add-box-tag');

    await click('add-box-submit');

    expect(added).toEqual([{ boxes: 2, tags: ['Second hand'] }]);
  });
});
