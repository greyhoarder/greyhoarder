import { TestBed } from '@angular/core/testing';
import type { FoundFaction } from '../../../../catalog/api';
import { FactionPicker } from './faction-picker';

const SPACE_MARINES: FoundFaction = {
  id: 'warhammer-40000/space-marines',
  name: 'Space Marines',
  systemName: 'Warhammer 40,000',
};

describe('Faction picker', () => {
  const render = async ({
    isOpen = false,
    results = [],
  }: { isOpen?: boolean; results?: readonly FoundFaction[] } = {}) => {
    const fixture = TestBed.createComponent(FactionPicker);
    fixture.componentRef.setInput('chosen', [
      { id: 'warhammer-40000/orks', name: 'Orks' },
      { id: 'warhammer-40000/goffs', name: 'Goffs' },
    ]);
    fixture.componentRef.setInput('isOpen', isOpen);
    fixture.componentRef.setInput('results', results);
    await fixture.whenStable();
    // The search opens in a popover outside the component.
    const find = <T extends HTMLElement = HTMLElement>(testId: string): T[] =>
      Array.from(document.querySelectorAll<T>(`[data-testid="${testId}"]`));
    return { fixture, find };
  };

  afterEach(() => TestBed.resetTestingModule());

  it('removes a faction with its ×', async () => {
    const { fixture, find } = await render();
    const removed = vi.fn();
    fixture.componentInstance.removed.subscribe(removed);

    find('add-custom-faction-remove')[0]?.click();

    expect(removed).toHaveBeenCalledExactlyOnceWith(0);
  });

  it('puts the cursor into the search as soon as it opens', async () => {
    const { find } = await render({ isOpen: true });

    expect(document.activeElement).toBe(find('add-custom-faction-search')[0]);
  });

  it('adds a faction found by the search', async () => {
    const { fixture, find } = await render({ isOpen: true, results: [SPACE_MARINES] });
    const added = vi.fn();
    fixture.componentInstance.added.subscribe(added);

    find('add-custom-faction-result')[0]?.click();

    expect(added).toHaveBeenCalledExactlyOnceWith(SPACE_MARINES);
  });

  it('closes the search with Escape', async () => {
    const { fixture, find } = await render({ isOpen: true });
    const toggled = vi.fn();
    fixture.componentInstance.toggled.subscribe(toggled);

    find('add-custom-faction-search')[0]?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    await fixture.whenStable();

    expect(toggled).toHaveBeenCalledOnce();
  });
});
