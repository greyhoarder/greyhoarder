import { TestBed } from '@angular/core/testing';
import { DeleteMinisDialog } from './delete-minis-dialog';

describe('Delete minis dialog', () => {
  const render = async ({
    isDeleting = false,
    hasFailed = false,
  }: { isDeleting?: boolean; hasFailed?: boolean } = {}) => {
    const fixture = TestBed.createComponent(DeleteMinisDialog);
    fixture.componentRef.setInput('screen', 'hoard');
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('count', 3);
    fixture.componentRef.setInput('names', 'Boy ×2, Nob');
    fixture.componentRef.setInput('isDeleting', isDeleting);
    fixture.componentRef.setInput('hasFailed', hasFailed);
    await fixture.whenStable();
    // The dialog opens in an overlay outside the component.
    const find = <T extends HTMLElement = HTMLElement>(testId: string): T | null =>
      document.querySelector<T>(`[data-testid="${testId}"]`);
    return { fixture, find };
  };

  afterEach(() => TestBed.resetTestingModule());

  it('says how many minis are deleted and which', async () => {
    const { find } = await render();

    const text = find('hoard-delete-dialog')?.textContent ?? '';

    expect(text).toContain('Delete 3 minis for good?');
    expect(text).toContain('Boy ×2, Nob');
  });

  it('deletes the minis when confirmed', async () => {
    const { fixture, find } = await render();
    const confirmed = vi.fn();
    fixture.componentInstance.confirmed.subscribe(confirmed);

    find('hoard-delete-confirm')?.click();

    expect(confirmed).toHaveBeenCalledOnce();
  });

  it('closes without deleting when cancelled', async () => {
    const { fixture, find } = await render();
    const confirmed = vi.fn();
    const closed = vi.fn();
    fixture.componentInstance.confirmed.subscribe(confirmed);
    fixture.componentInstance.closed.subscribe(closed);

    find('hoard-delete-cancel')?.click();
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

  it('says that deleting failed', async () => {
    const { find } = await render({ hasFailed: true });

    expect(find('hoard-delete-error')).not.toBeNull();
  });

  it('cannot be confirmed again while deleting', async () => {
    const { find } = await render({ isDeleting: true });

    const confirm = find<HTMLButtonElement>('hoard-delete-confirm');

    expect(confirm?.disabled).toBe(true);
    expect(confirm?.getAttribute('aria-busy')).toBe('true');
  });

  it('starts with the focus on cancelling', async () => {
    const { find } = await render();

    expect(document.activeElement).toBe(find('hoard-delete-cancel'));
  });
});
