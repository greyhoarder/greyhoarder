import { TestBed } from '@angular/core/testing';
import { SelectionBar } from './selection-bar';

describe('Selection bar', () => {
  const render = async ({ count = 3, canLeave = true }: { count?: number; canLeave?: boolean } = {}) => {
    const fixture = TestBed.createComponent(SelectionBar);
    fixture.componentRef.setInput('screen', 'hoard');
    fixture.componentRef.setInput('count', count);
    fixture.componentRef.setInput('canLeave', canLeave);
    await fixture.whenStable();
    const bar: HTMLElement = fixture.nativeElement;
    const find = <T extends HTMLElement = HTMLElement>(testId: string): T | null =>
      bar.querySelector<T>(`[data-testid="${testId}"]`);
    return { fixture, find };
  };

  const isDisabled = (button: HTMLButtonElement | null): boolean | undefined => button?.disabled;

  it('says how many minis are selected', async () => {
    const { find } = await render({ count: 3 });

    expect(find('hoard-selection-count')?.textContent?.trim()).toBe('3 minis selected');
  });

  it('offers no actions while nothing is selected', async () => {
    const { find } = await render({ count: 0, canLeave: false });

    const actions = ['hoard-selection-edit', 'hoard-selection-leave', 'hoard-selection-delete'].map((testId) =>
      isDisabled(find<HTMLButtonElement>(testId)),
    );

    expect(actions).toEqual([true, true, true]);
  });

  it('offers no leaving when none of the selected minis can leave', async () => {
    const { find } = await render({ count: 2, canLeave: false });

    const actions = ['hoard-selection-edit', 'hoard-selection-leave', 'hoard-selection-delete'].map((testId) =>
      isDisabled(find<HTMLButtonElement>(testId)),
    );

    expect(actions).toEqual([false, true, false]);
  });

  it('asks to delete the selected minis', async () => {
    const { fixture, find } = await render();
    const deleteChosen = vi.fn();
    fixture.componentInstance.deleteChosen.subscribe(deleteChosen);

    find('hoard-selection-delete')?.click();

    expect(deleteChosen).toHaveBeenCalledOnce();
  });

  it('ends the selection with "Reset"', async () => {
    const { fixture, find } = await render();
    const finished = vi.fn();
    fixture.componentInstance.finished.subscribe(finished);
    const reset = find('hoard-select-done');

    reset?.click();

    expect(reset?.textContent?.trim()).toBe('Reset');
    expect(finished).toHaveBeenCalledOnce();
  });

  it('offers to let the minis leave and delete them from its menu', async () => {
    const { fixture, find } = await render();
    find('hoard-selection-menu')?.click();
    await fixture.whenStable();

    const items = [...document.querySelectorAll('[role="menu"] [role="menuitem"]')];

    expect(items.map((item) => item.textContent?.trim())).toEqual(['Leave the hoard…', 'Delete']);
  });
});
