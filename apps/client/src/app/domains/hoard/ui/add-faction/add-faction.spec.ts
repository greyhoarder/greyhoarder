import { TestBed } from '@angular/core/testing';
import type { OwnFaction } from '@greyhoarder/domain/hoard';
import type { FoundFaction } from '../../../catalog/api';
import { AddFaction } from './add-faction';

const ORKS: FoundFaction = {
  id: 'warhammer-40000/orks',
  name: 'Orks',
  systemName: 'Warhammer 40,000',
};
const SPACE_MARINES: FoundFaction = {
  id: 'warhammer-40000/space-marines',
  name: 'Space Marines',
  systemName: 'Warhammer 40,000',
};
const SPACE_WOLVES: FoundFaction = {
  id: 'warhammer-40000/space-wolves',
  name: 'Space Wolves',
  systemName: 'Warhammer 40,000',
};
const CRIMSON_WOLVES: OwnFaction = { id: 'own/crimson-wolves', name: 'Crimson Wolves' };

/** The open search with this query and these factions found. */
async function render({
  query,
  results,
  ownResults = [],
}: {
  query: string;
  results: readonly FoundFaction[];
  ownResults?: readonly OwnFaction[];
}) {
  const fixture = TestBed.createComponent(AddFaction);
  fixture.componentRef.setInput('testId', 'mini');
  fixture.componentRef.setInput('isOpen', true);
  fixture.componentRef.setInput('query', query);
  fixture.componentRef.setInput('results', results);
  fixture.componentRef.setInput('ownResults', ownResults);
  await fixture.whenStable();
  // The search opens in a popover outside the component.
  const find = (testId: string): HTMLElement[] =>
    Array.from(document.querySelectorAll<HTMLElement>(`[data-testid="${testId}"]`));
  return { fixture, find };
}

describe('Add faction', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('does not offer a faction that is already chosen', async () => {
    const fixture = TestBed.createComponent(AddFaction);
    fixture.componentRef.setInput('testId', 'mini');
    fixture.componentRef.setInput('chosenIds', [ORKS.id]);
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('query', 'ork');

    fixture.componentRef.setInput('results', [ORKS, SPACE_MARINES]);
    await fixture.whenStable();

    // The search opens in a popover outside the component.
    const offered = Array.from(document.querySelectorAll('[data-testid="mini-faction-result"]'), (result) =>
      result.textContent?.replace(/\s+/g, ' ').trim(),
    );
    expect(offered).toEqual(['Space Marines · Warhammer 40,000']);
  });

  it("offers a name no faction has as a new faction of the user's own", async () => {
    const { fixture, find } = await render({ query: 'Crimson Wolves', results: [SPACE_WOLVES] });
    const created = vi.fn();
    fixture.componentInstance.created.subscribe(created);

    const [create] = find('mini-faction-create');
    create?.click();

    expect(create?.textContent?.trim()).toBe('Create “Crimson Wolves”');
    expect(created).toHaveBeenCalledExactlyOnceWith('Crimson Wolves');
  });

  it("offers the user's own factions first, marked as their own", async () => {
    const { find } = await render({
      query: 'wolves',
      results: [SPACE_WOLVES],
      ownResults: [CRIMSON_WOLVES],
    });

    expect(find('mini-faction-result').map((result) => result.textContent?.replace(/\s+/g, ' ').trim())).toEqual([
      'Crimson Wolves · Your own',
      'Space Wolves · Warhammer 40,000',
    ]);
  });
});
