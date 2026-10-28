import { TestBed } from '@angular/core/testing';
import { DeleteBoxDialog } from './delete-box-dialog';

describe('Delete box dialog', () => {
  const render = async ({ miniCount = 3 }: { miniCount?: number } = {}) => {
    const fixture = TestBed.createComponent(DeleteBoxDialog);
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('name', 'Boyz');
    fixture.componentRef.setInput('miniCount', miniCount);
    await fixture.whenStable();
    // The dialog opens in an overlay outside the component.
    const find = <T extends HTMLElement = HTMLElement>(testId: string): T | null =>
      document.querySelector<T>(`[data-testid="${testId}"]`);
    const description = (): string =>
      find('box-delete-box-dialog')?.querySelector('p')?.textContent?.trim() ?? '';
    return { fixture, find, description };
  };

  afterEach(() => TestBed.resetTestingModule());

  it('says how many minis are deleted with the box', async () => {
    const { description } = await render({ miniCount: 3 });

    expect(description()).toContain('3 minis');
  });

  it('says nothing about minis for a box without any', async () => {
    const { description } = await render({ miniCount: 0 });

    expect(description()).toBe("This can't be undone.");
  });

  it('deletes the box when confirmed', async () => {
    const { fixture, find } = await render();
    const confirmed = vi.fn();
    fixture.componentInstance.confirmed.subscribe(confirmed);

    find('box-delete-box-confirm')?.click();

    expect(confirmed).toHaveBeenCalledOnce();
  });

  it('closes without deleting when cancelled', async () => {
    const { fixture, find } = await render();
    const confirmed = vi.fn();
    const closed = vi.fn();
    fixture.componentInstance.confirmed.subscribe(confirmed);
    fixture.componentInstance.closed.subscribe(closed);

    find('box-delete-box-cancel')?.click();
    await fixture.whenStable();

    expect(closed).toHaveBeenCalledOnce();
    expect(confirmed).not.toHaveBeenCalled();
  });

  it('closes without deleting with the × in its corner', async () => {
    const { fixture } = await render();
    const confirmed = vi.fn();
    const closed = vi.fn();
    fixture.componentInstance.confirmed.subscribe(confirmed);
    fixture.componentInstance.closed.subscribe(closed);

    document.querySelector<HTMLButtonElement>('[aria-label="Close"]')?.click();
    await fixture.whenStable();

    expect(closed).toHaveBeenCalledOnce();
    expect(confirmed).not.toHaveBeenCalled();
  });

  it('starts with the focus on cancelling', async () => {
    const { find } = await render();

    expect(document.activeElement).toBe(find('box-delete-box-cancel'));
  });
});
