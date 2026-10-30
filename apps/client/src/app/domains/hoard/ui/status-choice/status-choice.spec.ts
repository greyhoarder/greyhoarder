import { TestBed } from '@angular/core/testing';
import { StatusChoice } from './status-choice';

describe('Status choice', () => {
  const render = async () => {
    const fixture = TestBed.createComponent(StatusChoice);
    fixture.componentRef.setInput('statuses', ['built', 'primed', 'painted', 'done']);
    fixture.componentRef.setInput('chosen', 'primed');
    fixture.componentRef.setInput('testId', 'add-minis-status');
    await fixture.whenStable();
    const chose = vi.fn();
    fixture.componentInstance.chose.subscribe(chose);
    const chips = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('[data-testid="add-minis-status"]'),
    );
    return { chose, chips };
  };

  it('marks the chosen status', async () => {
    const { chips } = await render();

    const chosen = chips.filter((chip) => chip.getAttribute('aria-checked') === 'true');

    expect(chosen.map((chip) => chip.textContent?.trim())).toEqual(['Primed']);
  });

  it('chooses a status with a click', async () => {
    const { chose, chips } = await render();

    chips.find((chip) => chip.textContent?.trim() === 'Painted')?.click();

    expect(chose).toHaveBeenCalledExactlyOnceWith('painted');
  });
});
