import { TestBed } from '@angular/core/testing';
import { EmptyBoxesDialog } from './empty-boxes-dialog';

describe('Empty boxes dialog', () => {
  const render = async ({
    names = ['Boyz'],
    hasFailed = false,
  }: { names?: readonly string[]; hasFailed?: boolean } = {}) => {
    const fixture = TestBed.createComponent(EmptyBoxesDialog);
    fixture.componentRef.setInput('screen', 'hoard');
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('names', names);
    fixture.componentRef.setInput('hasFailed', hasFailed);
    await fixture.whenStable();
    // The dialog opens in an overlay outside the component.
    const find = <T extends HTMLElement = HTMLElement>(testId: string): T | null =>
      document.querySelector<T>(`[data-testid="${testId}"]`);
    return { fixture, find };
  };

  afterEach(() => TestBed.resetTestingModule());

  it('asks whether to delete the box that has no minis left', async () => {
    const { find } = await render({ names: ['Boyz'] });

    const texts = ['hoard-empty-boxes-dialog', 'hoard-empty-boxes-keep', 'hoard-empty-boxes-delete'].map(
      (testId) => find(testId)?.textContent?.trim() ?? '',
    );

    expect(texts[0]).toContain('Boyz has no minis left. Delete the box as well?');
    expect(texts.slice(1)).toEqual(['Keep box', 'Delete box']);
  });

  it('asks once for several boxes, naming them', async () => {
    const { find } = await render({ names: ['Boyz', 'Nobz'] });

    const text = find('hoard-empty-boxes-dialog')?.textContent ?? '';

    expect(text).toContain('2 boxes have no minis left: Boyz, Nobz. Delete them as well?');
  });

  it('deletes the boxes when confirmed', async () => {
    const { fixture, find } = await render();
    const confirmed = vi.fn();
    fixture.componentInstance.confirmed.subscribe(confirmed);

    find('hoard-empty-boxes-delete')?.click();

    expect(confirmed).toHaveBeenCalledOnce();
  });

  it('keeps the boxes when kept', async () => {
    const { fixture, find } = await render();
    const confirmed = vi.fn();
    const closed = vi.fn();
    fixture.componentInstance.confirmed.subscribe(confirmed);
    fixture.componentInstance.closed.subscribe(closed);

    find('hoard-empty-boxes-keep')?.click();
    await fixture.whenStable();

    expect(closed).toHaveBeenCalledOnce();
    expect(confirmed).not.toHaveBeenCalled();
  });

  it('keeps the boxes when closed with the × in its corner', async () => {
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

  it('says that deleting failed', async () => {
    const { find } = await render({ hasFailed: true });

    expect(find('hoard-empty-boxes-error')).not.toBeNull();
  });

  it('starts with the focus on keeping', async () => {
    const { find } = await render();

    expect(document.activeElement).toBe(find('hoard-empty-boxes-keep'));
  });
});
