import { TestBed } from '@angular/core/testing';
import { DeleteBoxDialog } from './delete-box-dialog';

describe('Delete box dialog', () => {
  const render = async ({ builtMiniCount = 2, sprueMiniCount = 8 } = {}) => {
    const fixture = TestBed.createComponent(DeleteBoxDialog);
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('name', 'Boyz');
    fixture.componentRef.setInput('builtMiniCount', builtMiniCount);
    fixture.componentRef.setInput('sprueMiniCount', sprueMiniCount);
    await fixture.whenStable();
    // The dialog opens in an overlay outside the component.
    const find = <T extends HTMLElement = HTMLElement>(testId: string): T | null =>
      document.querySelector<T>(`[data-testid="${testId}"]`);
    const description = (): string => find('box-delete-box-dialog')?.querySelector('p')?.textContent?.trim() ?? '';
    return { fixture, find, description };
  };

  afterEach(() => TestBed.resetTestingModule());

  it('says how many built minis can stay and how many minis on the sprue go with the box', async () => {
    const { description } = await render({ builtMiniCount: 2, sprueMiniCount: 8 });

    expect(description()).toBe(
      'Its 2 built minis can stay in your hoard without a box, or be deleted with it, gone ones included. ' +
        "Its 8 minis on the sprue are deleted with it. This can't be undone.",
    );
  });

  it('says nothing about minis for a box without any', async () => {
    const { description } = await render({ builtMiniCount: 0, sprueMiniCount: 0 });

    expect(description()).toBe("This can't be undone.");
  });

  it('deletes the box with its minis with "Delete with minis"', async () => {
    const { fixture, find } = await render();
    const confirmed = vi.fn();
    fixture.componentInstance.confirmed.subscribe(confirmed);

    find('box-delete-box-confirm')?.click();

    expect(find('box-delete-box-confirm')?.textContent?.trim()).toBe('Delete with minis');
    expect(confirmed).toHaveBeenCalledOnce();
  });

  it('keeps the built minis with "Keep built minis"', async () => {
    const { fixture, find } = await render();
    const confirmed = vi.fn();
    const keptBuiltMinis = vi.fn();
    fixture.componentInstance.confirmed.subscribe(confirmed);
    fixture.componentInstance.keptBuiltMinis.subscribe(keptBuiltMinis);

    find('box-delete-box-keep-minis')?.click();

    expect(find('box-delete-box-keep-minis')?.textContent?.trim()).toBe('Keep built minis');
    expect(keptBuiltMinis).toHaveBeenCalledOnce();
    expect(confirmed).not.toHaveBeenCalled();
  });

  it('offers only "Delete box" for a box without minis past the sprue', async () => {
    const { find } = await render({ builtMiniCount: 0, sprueMiniCount: 8 });

    expect(find('box-delete-box-keep-minis')).toBeNull();
    expect(find('box-delete-box-confirm')?.textContent?.trim()).toBe('Delete box');
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
