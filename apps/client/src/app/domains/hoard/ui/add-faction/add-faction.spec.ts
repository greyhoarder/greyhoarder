import { TestBed } from '@angular/core/testing';
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
    const offered = Array.from(
      document.querySelectorAll('[data-testid="mini-faction-result"]'),
      (result) => result.textContent?.replace(/\s+/g, ' ').trim(),
    );
    expect(offered).toEqual(['Space Marines · Warhammer 40,000']);
  });
});
