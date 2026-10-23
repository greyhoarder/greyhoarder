import { TestBed } from '@angular/core/testing';
import { ProgressBar } from './progress-bar';

describe('Progress bar', () => {
  it('names the number of minis per status', async () => {
    const fixture = TestBed.createComponent(ProgressBar);
    fixture.componentRef.setInput('box', {
      id: '1',
      name: 'Intercessors',
      factions: ['Dark Angels'],
      minis: { primed: 5, based: 5 },
      addedOn: '2026-01-14',
      tags: [],
    });

    await fixture.whenStable();

    expect(
      (fixture.nativeElement as HTMLElement)
        .querySelector('[role="img"]')
        ?.getAttribute('aria-label'),
    ).toBe('5 primed, 5 based');
  });
});
