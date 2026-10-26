import { TestBed } from '@angular/core/testing';
import { LeavePanel } from './leave-panel';

describe('Leave panel', () => {
  const render = async ({ rowSize = 1 }: { rowSize?: number } = {}) => {
    const fixture = TestBed.createComponent(LeavePanel);
    fixture.componentRef.setInput('rowSize', rowSize);
    fixture.componentRef.setInput('recipientChoices', []);
    await fixture.whenStable();
    const panel: HTMLElement = fixture.nativeElement;
    const find = <T extends HTMLElement = HTMLElement>(selector: string): T | null =>
      panel.querySelector<T>(selector);
    const click = async (selector: string): Promise<void> => {
      find(selector)?.click();
      await fixture.whenStable();
    };
    const left = vi.fn();
    fixture.componentInstance.left.subscribe(left);
    return { fixture, find, click, left };
  };

  const confirm = '[data-testid="mini-leave-confirm"]';
  const sold = '[data-testid="mini-leave-reason"][data-reason="sold"]';

  it('lets the minis leave only once a reason is chosen', async () => {
    const { find, click } = await render();
    const before = find<HTMLButtonElement>(confirm)?.disabled;

    await click(sold);

    expect(before).toBe(true);
    expect(find<HTMLButtonElement>(confirm)?.disabled).toBe(false);
  });

  it('lets the minis leave for the chosen reason on the chosen day', async () => {
    const { fixture, find, click, left } = await render();
    await click(sold);
    const day = find<HTMLInputElement>('[data-testid="mini-leave-date"]');
    if (day) {
      day.value = '2026-09-14';
      day.dispatchEvent(new Event('change'));
    }
    await fixture.whenStable();

    await click(confirm);

    expect(left).toHaveBeenCalledExactlyOnceWith({
      departure: { reason: 'sold', on: '2026-09-14' },
      count: 1,
    });
  });

  it('lets as many minis of the row leave as chosen', async () => {
    const { click, left } = await render({ rowSize: 3 });
    await click(sold);
    await click('[data-testid="mini-leave-more"]');

    await click(confirm);

    expect(left).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ count: 2 }));
  });

  it('closes without letting any mini leave when cancelled', async () => {
    const { fixture, click, left } = await render();
    const closed = vi.fn();
    fixture.componentInstance.closed.subscribe(closed);
    await click(sold);

    await click('[data-testid="mini-leave-cancel"]');

    expect(closed).toHaveBeenCalledOnce();
    expect(left).not.toHaveBeenCalled();
  });
});
