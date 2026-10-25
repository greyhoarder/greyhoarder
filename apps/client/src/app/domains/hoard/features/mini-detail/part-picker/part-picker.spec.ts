import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Box, Mini, Part } from '@greyhoarder/domain/hoard';
import { HttpCatalogPartsAdapter, HttpKitsAdapter } from '../../../../catalog/api';
import { HttpBoxesAdapter } from '../../../infrastructure/http-boxes-adapter';
import { HttpMinisAdapter } from '../../../infrastructure/http-minis-adapter';
import { HttpPartsAdapter } from '../../../infrastructure/http-parts-adapter';
import { MiniEditor } from '../mini-editor';
import { PartPicker } from './part-picker';

const ORKS = 'warhammer-40000/orks';
const KILL_TEAM = 'kill-team/orks';

const slot = (count: number, buildsAs: string[], parts: string[]) => ({
  count,
  buildsAs,
  parts,
  factionIds: [],
});

const catalogKit = (
  id: string,
  name: string,
  variants: { name: string; slots: ReturnType<typeof slot>[] }[],
  minis: number,
  contains: { kitId: string; count: number }[] = [],
) => ({
  id,
  version: 1,
  manufacturer: 'games-workshop',
  name,
  factionIds: [ORKS],
  releases: [{ year: 2008 }],
  minis,
  isDraft: false,
  contains,
  variants,
});

const LOOTAS_KIT = catalogKit(
  'games-workshop/orks/lootas-2008',
  'Lootas',
  [
    {
      name: 'Lootas',
      slots: [
        slot(4, ['Loota'], ['Deffgun']),
        slot(1, ['Spanner'], ['Big Shoota', 'Rokkit Launcha']),
      ],
    },
    {
      name: 'Burna Boyz',
      slots: [
        slot(4, ['Burna Boy'], ['Burna']),
        slot(1, ['Spanner'], ['Big Shoota', 'Rokkit Launcha']),
      ],
    },
  ],
  5,
);

const BOYZ_KIT = catalogKit(
  'games-workshop/orks/boyz',
  'Boyz',
  [{ name: 'Boyz', slots: [slot(9, ['Boy'], ['Slugga', 'Choppa'])] }],
  9,
);

/** A Trukk of its own and a box of Boyz in it. */
const BATTLEFORCE_KIT = catalogKit(
  'games-workshop/orks/battleforce',
  'Battleforce',
  [{ name: 'Battleforce', slots: [slot(1, ['Trukk'], ['Big Shoota', "Wreckin' Ball"])] }],
  10,
  [{ kitId: BOYZ_KIT.id, count: 1 }],
);

const boxOf = (kit: { id: string; name: string }): Box => ({
  id: 'b1',
  name: `${kit.name} (2008)`,
  kit: { id: kit.id, version: 1, name: `${kit.name} (2008)` },
  factionIds: [ORKS],
  tags: [],
  addedOn: '2026-10-25',
});

const LOOTA: Mini = {
  id: 'm1',
  name: 'Lootas / Burna Boyz',
  factionIds: [ORKS],
  status: 'sprue',
  parts: [],
  sprueName: 'Lootas / Burna Boyz',
  boxId: 'b1',
  isOnWorkbench: false,
};

const POWER_KLAW: Part = { id: 'power-klaw', name: 'Power Klaw', aliases: ['Power Claw'] };

describe('Part picker', () => {
  let fixture: ComponentFixture<PartPicker>;

  /** An open picker for the mini, from a box of the kit, with the user's parts and the range. */
  async function showPicker({
    mini = LOOTA,
    kit = LOOTAS_KIT,
    parts = [],
    range = [],
  }: {
    mini?: Mini;
    kit?: ReturnType<typeof catalogKit>;
    parts?: Part[];
    range?: string[];
  } = {}): Promise<void> {
    TestBed.configureTestingModule({
      providers: [
        MiniEditor,
        {
          provide: HttpBoxesAdapter,
          useValue: { list: vi.fn(async () => ({ boxes: [boxOf(kit)], factionNames: new Map() })) },
        },
        {
          provide: HttpMinisAdapter,
          useValue: {
            list: vi.fn(async () => ({
              minis: [mini],
              factionNames: new Map([
                [ORKS, 'Orks'],
                [KILL_TEAM, 'Kill Team'],
              ]),
              systemNames: new Map(),
            })),
            update: vi.fn(async () => []),
          },
        },
        { provide: HttpPartsAdapter, useValue: { list: vi.fn(async () => parts) } },
        {
          provide: HttpKitsAdapter,
          useValue: {
            find: vi.fn(async () => ({
              kits: [kit],
              containedKits: new Map([[BOYZ_KIT.id, BOYZ_KIT]]),
              factionNames: new Map(),
            })),
          },
        },
        { provide: HttpCatalogPartsAdapter, useValue: { rangeParts: vi.fn(async () => range) } },
      ],
    });
    TestBed.inject(MiniEditor).miniId.set(mini.id);
    fixture = TestBed.createComponent(PartPicker);
    fixture.componentRef.setInput('isOpen', true);
    await fixture.whenStable();
  }

  const element = (): HTMLElement => fixture.nativeElement;
  const group = (name: string): HTMLElement | null =>
    element().querySelector(`[data-testid="mini-part-group"][data-group="${name}"]`);
  const optionsIn = (container: Element | null): HTMLElement[] => [
    ...(container?.querySelectorAll<HTMLElement>('[data-testid="mini-part-option"]') ?? []),
  ];
  const namesOf = (options: HTMLElement[]): string[] =>
    options.map(
      (option) => option.textContent?.replace(/\s+/g, ' ').trim().replace(/^\+ /, '') ?? '',
    );
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

  it('offers a mini of a bundle only the parts of its own slot', async () => {
    await showPicker({
      mini: { ...LOOTA, name: 'Boy', sprueName: 'Boy' },
      kit: BATTLEFORCE_KIT,
    });

    const kitParts = namesOf(optionsIn(group('kit')));

    expect(kitParts).toEqual(['Slugga', 'Choppa']);
  });

  it('offers parts of the range only while filtering', async () => {
    await showPicker({ range: ['Power Klaw', 'Kustom Shoota'] });
    const unfiltered = group('range');

    await filterParts('pow');

    expect(unfiltered).toBeNull();
    expect(namesOf(optionsIn(group('range')))).toEqual(['Power Klaw']);
  });

  it("names the range after the minis' first faction", async () => {
    await showPicker({ mini: { ...LOOTA, factionIds: [ORKS, KILL_TEAM] }, range: ['Power Klaw'] });

    await filterParts('pow');

    const name =
      group('range')?.querySelector('[data-testid="mini-part-group-name"]')?.textContent ?? '';
    expect(name).toContain('Orks');
    expect(name).not.toContain('Kill Team');
  });

  it('offers to create a part when the filter names none', async () => {
    await showPicker({ parts: [POWER_KLAW] });

    await filterParts('Grot Banner');

    const create = [
      ...(group('create')?.querySelectorAll('[data-testid="mini-part-create"]') ?? []),
    ];
    expect(create).toHaveLength(1);
    expect(create[0]?.textContent).toContain('Grot Banner');
  });

  it('no longer offers a chosen part', async () => {
    await showPicker({
      parts: [
        { id: 'deffgun', name: 'Deffgun', aliases: [] },
        { id: 'trophy-rack', name: 'Trophy Rack', aliases: [] },
      ],
    });
    await filterParts('deff');

    await choose('Deffgun');

    const offered = namesOf(optionsIn(element()));
    expect(offered).toContain('Trophy Rack');
    expect(offered).toContain('Burna');
    expect(offered).not.toContain('Deffgun');
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
