import { TestBed } from '@angular/core/testing';
import { RowCheck } from './row-check';

describe('Row check', () => {
  it('tells screen readers whether the row is selected', async () => {
    const fixture = TestBed.createComponent(RowCheck);
    fixture.componentRef.setInput('label', 'Select Boy');
    await fixture.whenStable();
    const check = (fixture.nativeElement as HTMLElement).querySelector('[role="checkbox"]');
    const unselected = check?.getAttribute('aria-checked');

    fixture.componentRef.setInput('isSelected', true);
    await fixture.whenStable();

    expect(unselected).toBe('false');
    expect(check?.getAttribute('aria-checked')).toBe('true');
  });
});
