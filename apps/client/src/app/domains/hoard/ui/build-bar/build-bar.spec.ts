import { TestBed } from '@angular/core/testing';
import { BuildBar } from './build-bar';

describe('Build bar', () => {
  const render = async ({
    name = 'Nob',
    count = 1,
    rowSize = 1,
  }: { name?: string; count?: number; rowSize?: number } = {}): Promise<HTMLElement> => {
    const fixture = TestBed.createComponent(BuildBar);
    fixture.componentRef.setInput('name', name);
    fixture.componentRef.setInput('parts', [{ name: 'Choppa', isSwappable: false }]);
    fixture.componentRef.setInput('count', count);
    fixture.componentRef.setInput('rowSize', rowSize);
    fixture.componentRef.setInput('isOnWorkbench', true);
    await fixture.whenStable();
    return fixture.nativeElement;
  };

  const summaryOf = (bar: HTMLElement): string =>
    bar.querySelector('[data-testid="mini-build-summary"]')?.textContent?.trim() ?? '';
  const buildButton = (bar: HTMLElement): HTMLButtonElement | null =>
    bar.querySelector<HTMLButtonElement>('[data-testid="mini-build"]');

  it('says what a single mini becomes', async () => {
    const bar = await render();

    expect(summaryOf(bar)).toBe('This mini becomes Nob with Choppa.');
  });

  it('says how many of the alike minis become what', async () => {
    const bar = await render({ count: 2, rowSize: 5 });

    expect(summaryOf(bar)).toBe('2 of 5 alike minis become Nob with Choppa.');
  });

  it('shows the count only for rows of more than one mini', async () => {
    const bars = [await render(), await render({ rowSize: 5 })];

    expect(bars.map((bar) => bar.querySelector('[data-testid="mini-build-count"]') !== null)).toEqual([false, true]);
  });

  it('offers to build only once a name is chosen', async () => {
    const bars = [await render({ name: '' }), await render()];

    expect(bars.map((bar) => buildButton(bar)?.disabled)).toEqual([true, false]);
  });
});
