import { TestBed } from '@angular/core/testing';
import { RowStepper } from './row-stepper';

function render(count: number) {
  const fixture = TestBed.createComponent(RowStepper);
  fixture.componentRef.setInput('count', count);
  fixture.componentRef.setInput('name', 'Boy');
  fixture.componentRef.setInput('testId', 'row');
  const changed: (1 | -1)[] = [];
  fixture.componentInstance.changed.subscribe((step) => changed.push(step));
  fixture.detectChanges();
  const find = (testId: string) => fixture.nativeElement.querySelector(`[data-testid="${testId}"]`) as HTMLElement;

  return { changed, find };
}

describe('Row stepper', () => {
  it('shows how many minis the row counts', () => {
    const { find } = render(7);

    expect(find('row-count').textContent?.trim()).toBe('7');
  });

  it('counts one more and one fewer', () => {
    const { changed, find } = render(7);

    find('row-more').click();
    find('row-less').click();

    expect(changed).toEqual([1, -1]);
  });

  it('does not go below no minis', () => {
    const { find } = render(0);

    expect((find('row-less') as HTMLButtonElement).disabled).toBe(true);
  });

  it('tells screen readers which row its buttons count, e.g. "One more: Boy"', () => {
    const { find } = render(7);

    expect([find('row-less').getAttribute('aria-label'), find('row-more').getAttribute('aria-label')]).toEqual([
      'One fewer: Boy',
      'One more: Boy',
    ]);
  });
});
