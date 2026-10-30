import { ComponentFixture, TestBed } from '@angular/core/testing';
import { type Part, toKit } from '@greyhoarder/domain/hoard';
import { PartPicker } from './part-picker';

const ORKS = 'warhammer-40000/orks';

const slot = (count: number, buildsAs: string[], parts: string[]) => ({
  count,
  buildsAs,
  parts,
  factionIds: [],
});

const LOOTAS_KIT = toKit(
  {
    id: 'games-workshop/orks/lootas-2008',
    version: 1,
    manufacturer: 'games-workshop',
    name: 'Lootas',
    factionIds: [ORKS],
    releases: [{ year: 2008 }],
    minis: 5,
    isDraft: false,
    contains: [],
    variants: [
      {
        name: 'Lootas',
        slots: [slot(4, ['Loota'], ['Deffgun']), slot(1, ['Spanner'], ['Big Shoota', 'Rokkit Launcha'])],
      },
      {
        name: 'Burna Boyz',
        slots: [slot(4, ['Burna Boy'], ['Burna']), slot(1, ['Spanner'], ['Big Shoota', 'Rokkit Launcha'])],
      },
    ],
  },
  new Map(),
);

const POWER_KLAW: Part = { id: 'power-klaw', name: 'Power Klaw', aliases: ['Power Claw'] };

describe('Part picker', () => {
  let fixture: ComponentFixture<PartPicker>;

  /** An open picker for Lootas on the sprue, with the user's parts and the range. */
  async function showPicker({
    parts = [],
    range = [],
    rangeName = 'Orks',
  }: { parts?: Part[]; range?: string[]; rangeName?: string } = {}): Promise<void> {
    fixture = TestBed.createComponent(PartPicker);
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('source', {
      kit: LOOTAS_KIT,
      sprueName: 'Lootas / Burna Boyz',
      vocabulary: parts,
      range,
      carried: [],
    });
    fixture.componentRef.setInput('boxName', 'Lootas or Burna Boyz (2008)');
    fixture.componentRef.setInput('rangeName', rangeName);
    await fixture.whenStable();
  }

  const element = (): HTMLElement => fixture.nativeElement;
  const group = (name: string): HTMLElement | null =>
    element().querySelector(`[data-testid="mini-part-group"][data-group="${name}"]`);
  const optionsIn = (container: Element | null): HTMLElement[] => [
    ...(container?.querySelectorAll<HTMLElement>('[data-testid="mini-part-option"]') ?? []),
  ];
  const namesOf = (options: HTMLElement[]): string[] =>
    options.map((option) => option.textContent?.replace(/\s+/g, ' ').trim().replace(/^\+ /, '') ?? '');
  const filterField = (): HTMLInputElement =>
    element().querySelector<HTMLInputElement>('[data-testid="mini-part-filter"]')!;

  async function filterParts(text: string): Promise<void> {
    filterField().value = text;
    filterField().dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  async function choose(name: string): Promise<void> {
    optionsIn(element())
      .find((option) => namesOf([option])[0] === name)
      ?.click();
    await fixture.whenStable();
  }

  it("offers the parts the kit gives the minis' slot first, then the rest of the user's parts", async () => {
    await showPicker({
      parts: [
        { id: 'deffgun', name: 'Deffgun', aliases: [] },
        { id: 'trophy-rack', name: 'Trophy Rack', aliases: [] },
        POWER_KLAW,
      ],
    });

    const groups = [...element().querySelectorAll('[data-testid="mini-part-group"]')];

    expect(groups.map((shown) => shown.getAttribute('data-group'))).toEqual(['kit', 'vocabulary']);
    expect(namesOf(optionsIn(group('kit')))).toEqual(['Deffgun', 'Burna']);
    expect(namesOf(optionsIn(group('vocabulary')))).toEqual(['Power Klaw', 'Trophy Rack']);
  });

  it('names the range group after the given range', async () => {
    await showPicker({ range: ['Power Klaw'], rangeName: 'Orks' });

    await filterParts('pow');

    const name = group('range')?.querySelector('[data-testid="mini-part-group-name"]')?.textContent ?? '';
    expect(name).toContain('Orks');
  });

  it('offers to create a part when the filter names none', async () => {
    await showPicker({ parts: [POWER_KLAW] });

    await filterParts('Grot Banner');

    const create = [...(group('create')?.querySelectorAll('[data-testid="mini-part-create"]') ?? [])];
    expect(create).toHaveLength(1);
    expect(create[0]?.textContent).toContain('Grot Banner');
  });

  it('hands on the chosen part', async () => {
    await showPicker({ parts: [POWER_KLAW] });
    const added = vi.fn();
    fixture.componentInstance.added.subscribe(added);

    await choose('Power Klaw');

    expect(added).toHaveBeenCalledWith(expect.objectContaining({ partId: 'power-klaw' }));
  });

  it('empties the filter after a part is chosen', async () => {
    await showPicker({ parts: [{ id: 'deffgun', name: 'Deffgun', aliases: [] }] });
    await filterParts('deff');

    await choose('Deffgun');

    expect(filterField().value).toBe('');
  });

  it('empties the filter when it closes', async () => {
    await showPicker();
    await filterParts('big');

    fixture.componentRef.setInput('isOpen', false);
    await fixture.whenStable();
    fixture.componentRef.setInput('isOpen', true);
    await fixture.whenStable();

    expect(filterField().value).toBe('');
  });
});
