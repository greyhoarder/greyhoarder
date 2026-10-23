import { TestBed } from '@angular/core/testing';
import { KitCard } from './kit-card';

describe('Kit card', () => {
  it('marks a kit that is not yet checked against a box as "Not checked"', async () => {
    const fixture = TestBed.createComponent(KitCard);
    fixture.componentRef.setInput('kit', {
      id: 'games-workshop/orks/boyz-2026',
      name: 'Boyz',
      manufacturer: 'Games Workshop',
      factions: ['Orks'],
      isDraft: true,
      variants: [],
      minis: 11,
    });

    await fixture.whenStable();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[data-testid="add-box-kit-draft"]')
        ?.textContent,
    ).toBe('Not checked');
  });
});
