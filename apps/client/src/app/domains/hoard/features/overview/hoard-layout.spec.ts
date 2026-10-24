import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MinisList } from '../../data/minis-list';
import { HoardLayout } from './hoard-layout';

describe('Hoard layout', () => {
  let fixture: ComponentFixture<HoardLayout>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    fixture = TestBed.createComponent(HoardLayout);
    await fixture.whenStable();
  });

  const textOf = (testId: string): string =>
    (fixture.nativeElement as HTMLElement)
      .querySelector(`[data-testid="${testId}"]`)
      ?.textContent?.replace(/\s+/g, ' ')
      .trim() ?? '';

  it('sums up the minis, boxes and painted minis of the hoard', () => {
    expect(textOf('hoard-summary')).toBe('46 minis from 6 boxes · 9 painted');
  });

  it('counts the shown minis on the tab while a search narrows the list', async () => {
    TestBed.inject(MinisList).query.set('klaw');

    await fixture.whenStable();

    expect(textOf('hoard-tab-minis-count')).toBe('1 of 46');
  });
});
