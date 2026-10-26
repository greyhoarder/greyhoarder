import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { BuildAs, type NameSuggestion } from './build-as';

const SUGGESTIONS: NameSuggestion[] = [
  { name: 'Loota', left: 3 },
  { name: 'Burna Boy', left: 2 },
];

describe('Build as', () => {
  let fixture: ComponentFixture<BuildAs>;

  const render = async ({
    suggestions = SUGGESTIONS,
    name = '',
    ownName = '',
    count = 1,
  }: {
    suggestions?: NameSuggestion[];
    name?: string;
    ownName?: string;
    count?: number;
  } = {}): Promise<HTMLElement> => {
    fixture = TestBed.createComponent(BuildAs);
    fixture.componentRef.setInput('suggestions', suggestions);
    fixture.componentRef.setInput('name', name);
    fixture.componentRef.setInput('ownName', ownName);
    fixture.componentRef.setInput('count', count);
    await fixture.whenStable();
    return fixture.nativeElement;
  };

  const tiles = (section: HTMLElement): HTMLElement[] => [
    ...section.querySelectorAll<HTMLElement>('[data-testid="mini-build-as"]'),
  ];
  const hintOf = (tile: HTMLElement | undefined): Element | null | undefined =>
    tile?.querySelector('[data-testid="mini-name-left"]');

  it('shows a tile for every suggested name with how many are left in the box', async () => {
    const section = await render();

    expect(
      tiles(section).map((tile) => [
        tile.querySelector('[data-testid="mini-build-as-name"]')?.textContent?.trim(),
        hintOf(tile)?.textContent?.trim(),
      ]),
    ).toEqual([
      ['Loota', '3 left in this box'],
      ['Burna Boy', '2 left in this box'],
    ]);
  });

  it('greys out a name with none left in the box instead of warning', async () => {
    const section = await render({ suggestions: [{ name: 'Loota', left: 0 }] });

    const hint = hintOf(tiles(section)[0]);

    expect(hint?.getAttribute('data-empty')).toBe('true');
    expect(hint?.getAttribute('data-warning')).toBe('false');
  });

  it('warns when more minis are to be built than are left for the chosen name', async () => {
    const section = await render({ name: 'Burna Boy', count: 3 });

    const hint = hintOf(tiles(section)[1]);

    expect(hint?.getAttribute('data-warning')).toBe('true');
    expect(hint?.textContent).toContain('2');
  });

  it('marks the chosen name as pressed unless an own name is typed', async () => {
    const pressed = (section: HTMLElement): (string | null)[] =>
      tiles(section).map((tile) => tile.getAttribute('aria-pressed'));
    const chosen = pressed(await render({ name: 'Loota' }));

    const typed = pressed(await render({ name: 'Loota', ownName: 'Tankbusta' }));

    expect([chosen, typed]).toEqual([
      ['true', 'false'],
      ['false', 'false'],
    ]);
  });
});
