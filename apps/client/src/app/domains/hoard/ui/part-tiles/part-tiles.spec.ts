import { TestBed } from '@angular/core/testing';
import { PartTiles, type PartTile } from './part-tiles';

const PARTS: PartTile[] = [
  { name: 'Deffgun', isSwappable: false },
  { name: 'Power Klaw', isSwappable: true },
];

describe('Part tiles', () => {
  const render = async (isPickerOpen = false): Promise<HTMLElement> => {
    const fixture = TestBed.createComponent(PartTiles);
    fixture.componentRef.setInput('parts', PARTS);
    fixture.componentRef.setInput('isPickerOpen', isPickerOpen);
    fixture.componentRef.setInput('source', { vocabulary: [], range: [], carried: [] });
    await fixture.whenStable();
    return fixture.nativeElement;
  };

  const all = (section: HTMLElement, testId: string): HTMLElement[] => [
    ...section.querySelectorAll<HTMLElement>(`[data-testid="${testId}"]`),
  ];

  it('shows a tile for every part with whether it is glued or swappable', async () => {
    const section = await render();

    expect(
      all(section, 'mini-part').map((tile) => [
        tile.querySelector('[data-testid="mini-part-name"]')?.textContent?.trim(),
        tile.querySelector('[data-testid="mini-part-swappable"]')?.textContent?.trim(),
      ]),
    ).toEqual([
      ['Deffgun', 'Glued'],
      ['Power Klaw', 'Swappable'],
    ]);
  });

  it('tells screen readers whether a part is swappable', async () => {
    const section = await render();

    expect(
      all(section, 'mini-part-swappable').map((toggle) => toggle.getAttribute('aria-pressed')),
    ).toEqual(['false', 'true']);
  });

  it('tells screen readers whether the part picker is open', async () => {
    const addPart = async (isOpen: boolean): Promise<HTMLElement | undefined> =>
      all(await render(isOpen), 'mini-add-part')[0];
    const [closed, opened] = [await addPart(false), await addPart(true)];

    const picker = opened?.ownerDocument.getElementById(opened.getAttribute('aria-controls') ?? '');

    expect([closed?.getAttribute('aria-expanded'), opened?.getAttribute('aria-expanded')]).toEqual([
      'false',
      'true',
    ]);
    expect(picker).not.toBeNull();
  });
});
