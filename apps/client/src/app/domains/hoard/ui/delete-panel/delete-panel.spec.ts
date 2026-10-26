import { TestBed } from '@angular/core/testing';
import { DeletePanel } from './delete-panel';

describe('Delete panel', () => {
  const render = async ({
    rowSize = 1,
    isDeleting = false,
  }: { rowSize?: number; isDeleting?: boolean } = {}) => {
    const fixture = TestBed.createComponent(DeletePanel);
    fixture.componentRef.setInput('rowSize', rowSize);
    fixture.componentRef.setInput('isDeleting', isDeleting);
    await fixture.whenStable();
    const panel: HTMLElement = fixture.nativeElement;
    const find = <T extends HTMLElement = HTMLElement>(testId: string): T | null =>
      panel.querySelector<T>(`[data-testid="${testId}"]`);
    const click = async (testId: string): Promise<void> => {
      find(testId)?.click();
      await fixture.whenStable();
    };
    return { fixture, panel, find, click };
  };

  const questionOf = (panel: HTMLElement): string =>
    panel.querySelector('h2')?.textContent?.trim() ?? '';

  it('says how many minis of the row are deleted', async () => {
    const { panel, click } = await render({ rowSize: 3 });
    const before = questionOf(panel);

    await click('mini-delete-more');

    expect(before).not.toContain('2');
    expect(questionOf(panel)).toContain('2');
  });

  it('offers to choose how many only for a row of more than one mini', async () => {
    const panels = [await render(), await render({ rowSize: 3 })];

    expect(panels.map(({ find }) => find('mini-delete-count') !== null)).toEqual([false, true]);
  });

  it('deletes no more minis than the row has', async () => {
    const { find, click } = await render({ rowSize: 2 });

    await click('mini-delete-more');
    await click('mini-delete-more');
    await click('mini-delete-more');

    expect(find('mini-delete-count')?.textContent?.trim()).toBe('2');
  });

  it('deletes the chosen number of minis', async () => {
    const { fixture, click } = await render({ rowSize: 3 });
    const deleted = vi.fn();
    fixture.componentInstance.deleted.subscribe(deleted);
    await click('mini-delete-more');

    await click('mini-delete-confirm');

    expect(deleted).toHaveBeenCalledExactlyOnceWith(2);
  });

  it('closes without deleting when cancelled', async () => {
    const { fixture, click } = await render();
    const deleted = vi.fn();
    const closed = vi.fn();
    fixture.componentInstance.deleted.subscribe(deleted);
    fixture.componentInstance.closed.subscribe(closed);

    await click('mini-delete-cancel');

    expect(closed).toHaveBeenCalledOnce();
    expect(deleted).not.toHaveBeenCalled();
  });

  it('cannot be confirmed again while deleting', async () => {
    const { find } = await render({ isDeleting: true });

    const confirm = find<HTMLButtonElement>('mini-delete-confirm');

    expect(confirm?.disabled).toBe(true);
    expect(confirm?.getAttribute('aria-busy')).toBe('true');
  });

  it('starts with the focus on cancelling', async () => {
    const { find } = await render();

    expect(document.activeElement).toBe(find('mini-delete-cancel'));
  });
});
