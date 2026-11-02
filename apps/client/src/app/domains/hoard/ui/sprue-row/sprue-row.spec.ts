import { TestBed } from '@angular/core/testing';
import type { SprueMinis } from '@greyhoarder/domain/hoard';
import { SprueRow } from './sprue-row';

const SLOT: SprueMinis = {
  count: 10,
  name: 'Boy',
  factionIds: [],
  builds: ['Boy', 'Nob'],
  parts: ['Choppa', 'Slugga'],
  isUndecided: false,
};

function render(row: SprueMinis) {
  const fixture = TestBed.createComponent(SprueRow);
  fixture.componentRef.setInput('row', row);
  fixture.componentRef.setInput('count', row.count);
  fixture.componentRef.setInput('testId', 'row');
  fixture.detectChanges();

  const texts = (testId: string): string[] =>
    [...(fixture.nativeElement as HTMLElement).querySelectorAll(`[data-testid="${testId}"]`)].map(
      (element) => element.textContent?.replace(/\s+/g, ' ').trim() ?? '',
    );

  return { texts };
}

describe('Sprue row', () => {
  it('shows a row of a slot with its suggested names joined with "or" and its parts', () => {
    const { texts } = render(SLOT);

    const shown = [texts('row-name'), texts('row-part')];

    expect(shown).toEqual([['Boy or Nob'], ['Choppa', 'Slugga']]);
  });

  it("shows an undecided row with the kit's name and what each mini can become", () => {
    const { texts } = render({ ...SLOT, name: 'Boyz', parts: [], isUndecided: true });

    const shown = [texts('row-name'), texts('row-builds')];

    expect(shown).toEqual([['Boyz'], ['Each can become Boy or Nob.']]);
  });
});
