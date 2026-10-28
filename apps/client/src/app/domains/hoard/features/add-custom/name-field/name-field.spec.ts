import { TestBed } from '@angular/core/testing';
import { NameField } from './name-field';

describe('Name field', () => {
  /** "Tank" typed, with one name of the hoard and one of the catalog to suggest. */
  const typeTank = async () => {
    const fixture = TestBed.createComponent(NameField);
    fixture.componentRef.setInput('value', 'Tank');
    fixture.componentRef.setInput('ownNames', [{ name: 'Tankbusta' }]);
    fixture.componentRef.setInput('catalogNames', [
      { name: 'Tankbusta Rokkiteer', detail: 'Orks' },
    ]);
    const valueChange = vi.fn();
    fixture.componentInstance.valueChange.subscribe(valueChange);
    const field: HTMLElement = fixture.nativeElement;
    const input = field.querySelector<HTMLInputElement>('[data-testid="add-custom-name"]');
    input?.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    const press = async (key: string): Promise<void> => {
      input?.dispatchEvent(new KeyboardEvent('keydown', { key }));
      await fixture.whenStable();
    };
    const suggestions = (): HTMLElement[] =>
      Array.from(field.querySelectorAll<HTMLElement>('[data-testid="add-custom-name-suggestion"]'));
    const list = (): HTMLElement | null => field.querySelector('[role="listbox"]');
    return { valueChange, press, suggestions, list };
  };

  it('suggests names from the hoard and the catalog while typing', async () => {
    const { list, suggestions } = await typeTank();

    expect(list()?.textContent).toContain('Your minis');
    expect(list()?.textContent).toContain('From the catalog');
    expect(suggestions().map((suggestion) => suggestion.textContent?.trim())).toEqual([
      'Tankbusta',
      expect.stringContaining('Tankbusta Rokkiteer'),
    ]);
  });

  it('fills in a suggestion when it is clicked', async () => {
    const { valueChange, suggestions } = await typeTank();

    suggestions()[1]?.click();

    expect(valueChange).toHaveBeenLastCalledWith('Tankbusta Rokkiteer');
  });

  it('fills in the suggestion chosen with the arrow keys on Enter', async () => {
    const { valueChange, press } = await typeTank();

    await press('ArrowDown');
    await press('Enter');

    expect(valueChange).toHaveBeenLastCalledWith('Tankbusta');
  });

  it('closes the suggestions with Escape', async () => {
    const { press, list } = await typeTank();

    await press('Escape');

    expect(list()).toBeNull();
  });
});
